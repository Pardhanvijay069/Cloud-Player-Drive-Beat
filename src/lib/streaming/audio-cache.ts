/**
 * Audio Cache Manager
 *
 * Implements intelligent offline caching for audio tracks using the Cache API.
 * Strategy: cache recently played tracks up to a storage limit, with LRU eviction.
 *
 * Why Cache API over IndexedDB:
 * - Cache API stores Response objects natively (perfect for streaming)
 * - Works seamlessly with Service Workers
 * - Built-in key matching by URL
 * - Better suited for large binary data than IndexedDB
 */

const CACHE_NAME = "drivebeat-audio-v1";
const METADATA_CACHE = "drivebeat-metadata-v1";

/** Max total cache size in bytes (150MB) */
const MAX_CACHE_SIZE = 150 * 1024 * 1024;

/** Max number of tracks to cache */
const MAX_CACHED_TRACKS = 30;

/** Metadata stored alongside each cached track */
type CacheEntry = {
  fileId: string;
  name: string;
  size: number;
  cachedAt: number;
  lastAccessed: number;
};

/**
 * Check if Cache API is available (not available in SSR or some browsers)
 */
function isCacheAvailable(): boolean {
  return typeof window !== "undefined" && "caches" in window;
}

/**
 * Get the audio cache instance
 */
async function getAudioCache(): Promise<Cache | null> {
  if (!isCacheAvailable()) return null;
  try {
    return await caches.open(CACHE_NAME);
  } catch {
    return null;
  }
}

/**
 * Get the metadata cache instance
 */
async function getMetadataCache(): Promise<Cache | null> {
  if (!isCacheAvailable()) return null;
  try {
    return await caches.open(METADATA_CACHE);
  } catch {
    return null;
  }
}

/**
 * Load all cache entry metadata
 */
async function loadMetadata(): Promise<CacheEntry[]> {
  const metaCache = await getMetadataCache();
  if (!metaCache) return [];

  try {
    const response = await metaCache.match("entries");
    if (!response) return [];
    return (await response.json()) as CacheEntry[];
  } catch {
    return [];
  }
}

/**
 * Save cache entry metadata
 */
async function saveMetadata(entries: CacheEntry[]): Promise<void> {
  const metaCache = await getMetadataCache();
  if (!metaCache) return;

  try {
    await metaCache.put(
      "entries",
      new Response(JSON.stringify(entries), {
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch {
    // Silently fail — metadata is not critical
  }
}

/**
 * Get the stream URL for a given file ID
 */
function getStreamUrl(fileId: string): string {
  return `/api/stream/${fileId}`;
}

/**
 * Check if a track is cached
 */
export async function isTrackCached(fileId: string): Promise<boolean> {
  const cache = await getAudioCache();
  if (!cache) return false;

  try {
    const match = await cache.match(getStreamUrl(fileId));
    return match !== undefined;
  } catch {
    return false;
  }
}

/**
 * Cache a track's audio response.
 * Fetches the full audio file and stores it in the cache.
 * Performs LRU eviction if storage limits are exceeded.
 */
export async function cacheTrack(
  fileId: string,
  name: string
): Promise<boolean> {
  const cache = await getAudioCache();
  if (!cache) return false;

  // Don't re-cache if already cached
  if (await isTrackCached(fileId)) {
    // Update last accessed time
    const entries = await loadMetadata();
    const entry = entries.find((e) => e.fileId === fileId);
    if (entry) {
      entry.lastAccessed = Date.now();
      await saveMetadata(entries);
    }
    return true;
  }

  try {
    // Fetch the full audio file
    const response = await fetch(getStreamUrl(fileId), {
      cache: "no-store",
    });

    if (!response.ok || !response.body) return false;

    // Clone response so we can read size and store it
    const cloned = response.clone();
    const blob = await response.blob();
    const size = blob.size;

    // Evict old entries if needed
    let entries = await loadMetadata();
    entries = await evictIfNeeded(entries, size, cache);

    // Store in cache
    await cache.put(
      getStreamUrl(fileId),
      new Response(blob, {
        status: 200,
        headers: {
          "Content-Type": cloned.headers.get("Content-Type") || "audio/mpeg",
          "Content-Length": String(size),
          "Accept-Ranges": "bytes",
        },
      })
    );

    // Update metadata
    entries.push({
      fileId,
      name,
      size,
      cachedAt: Date.now(),
      lastAccessed: Date.now(),
    });
    await saveMetadata(entries);

    return true;
  } catch {
    return false;
  }
}

/**
 * Retrieve a cached response for a track.
 * Supports Range requests by slicing the cached blob.
 */
export async function getCachedTrack(
  fileId: string,
  rangeHeader?: string | null
): Promise<Response | null> {
  const cache = await getAudioCache();
  if (!cache) return null;

  try {
    const cachedResponse = await cache.match(getStreamUrl(fileId));
    if (!cachedResponse) return null;

    // Update last accessed time
    const entries = await loadMetadata();
    const entry = entries.find((e) => e.fileId === fileId);
    if (entry) {
      entry.lastAccessed = Date.now();
      await saveMetadata(entries);
    }

    // If no range requested, return full response
    if (!rangeHeader) return cachedResponse;

    // Parse range header: "bytes=START-END"
    const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
    if (!match) return cachedResponse;

    const blob = await cachedResponse.blob();
    const totalSize = blob.size;
    const start = parseInt(match[1], 10);
    const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

    const sliced = blob.slice(start, end + 1);

    return new Response(sliced, {
      status: 206,
      headers: {
        "Content-Type": cachedResponse.headers.get("Content-Type") || "audio/mpeg",
        "Content-Length": String(sliced.size),
        "Content-Range": `bytes ${start}-${end}/${totalSize}`,
        "Accept-Ranges": "bytes",
      },
    });
  } catch {
    return null;
  }
}

/**
 * Remove a track from cache
 */
export async function uncacheTrack(fileId: string): Promise<void> {
  const cache = await getAudioCache();
  if (!cache) return;

  try {
    await cache.delete(getStreamUrl(fileId));
    const entries = await loadMetadata();
    const filtered = entries.filter((e) => e.fileId !== fileId);
    await saveMetadata(filtered);
  } catch {
    // Silently fail
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  trackCount: number;
  totalSize: number;
  maxSize: number;
  entries: CacheEntry[];
}> {
  const entries = await loadMetadata();
  const totalSize = entries.reduce((sum, e) => sum + e.size, 0);

  return {
    trackCount: entries.length,
    totalSize,
    maxSize: MAX_CACHE_SIZE,
    entries: entries.sort((a, b) => b.lastAccessed - a.lastAccessed),
  };
}

/**
 * Clear the entire audio cache
 */
export async function clearAudioCache(): Promise<void> {
  if (!isCacheAvailable()) return;

  try {
    await caches.delete(CACHE_NAME);
    await caches.delete(METADATA_CACHE);
  } catch {
    // Silently fail
  }
}

/**
 * LRU eviction — remove least-recently-accessed tracks until we're under limits
 */
async function evictIfNeeded(
  entries: CacheEntry[],
  incomingSize: number,
  cache: Cache
): Promise<CacheEntry[]> {
  let currentSize = entries.reduce((sum, e) => sum + e.size, 0);
  let currentEntries = [...entries];

  // Sort by last accessed (oldest first) for LRU eviction
  const sortedByAccess = [...currentEntries].sort(
    (a, b) => a.lastAccessed - b.lastAccessed
  );

  let evictionIndex = 0;

  while (
    (currentSize + incomingSize > MAX_CACHE_SIZE ||
      currentEntries.length >= MAX_CACHED_TRACKS) &&
    evictionIndex < sortedByAccess.length
  ) {
    const victim = sortedByAccess[evictionIndex];
    try {
      await cache.delete(getStreamUrl(victim.fileId));
    } catch {
      // Continue even if delete fails
    }
    currentSize -= victim.size;
    currentEntries = currentEntries.filter((e) => e.fileId !== victim.fileId);
    evictionIndex++;
  }

  return currentEntries;
}
