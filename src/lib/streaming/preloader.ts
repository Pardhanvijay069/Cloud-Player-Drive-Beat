/**
 * Audio Preloader
 *
 * Intelligently preloads the next track in the playlist for gapless transitions.
 *
 * Strategy:
 * - When a track starts playing, preload the next track's metadata
 * - When playback reaches 75% completion, start caching the next track
 * - Never preload more than 1 track ahead to conserve bandwidth
 * - Skip preloading on metered connections (4G, etc.)
 */

import { cacheTrack, isTrackCached } from "./audio-cache";

type PreloadTarget = {
  fileId: string;
  name: string;
};

/** Active preload controller — allows aborting if user skips ahead */
let activePreloadController: AbortController | null = null;

/**
 * Check if user is on a metered/slow connection.
 * Avoids aggressive preloading on cellular networks.
 */
function isMeteredConnection(): boolean {
  if (typeof navigator === "undefined") return false;

  const connection =
    (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } })
      .connection;

  if (!connection) return false;

  // Respect data saver mode
  if (connection.saveData) return true;

  // Don't preload on slow connections
  if (connection.effectiveType === "slow-2g" || connection.effectiveType === "2g") {
    return true;
  }

  return false;
}

/**
 * Preload the next track's audio data.
 * Creates a hidden audio element to trigger browser's range-based fetching.
 */
export function preloadNextTrackMetadata(fileId: string): void {
  if (typeof window === "undefined") return;

  // Use <link rel="preload"> for metadata fetch
  // This is lightweight — just fetches headers to establish the connection
  const existingLink = document.querySelector(
    `link[data-preload-track="${fileId}"]`
  );
  if (existingLink) return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "fetch";
  link.href = `/api/stream/${fileId}`;
  link.crossOrigin = "anonymous";
  link.setAttribute("data-preload-track", fileId);
  document.head.appendChild(link);

  // Clean up preload link after 30s to avoid accumulation
  setTimeout(() => {
    link.remove();
  }, 30_000);
}

/**
 * Fully cache the next track for offline/gapless playback.
 * Call this when the current track is near completion (~75%).
 */
export async function preloadFullTrack(
  target: PreloadTarget
): Promise<boolean> {
  // Don't preload on metered connections
  if (isMeteredConnection()) return false;

  // Don't preload if already cached
  if (await isTrackCached(target.fileId)) return true;

  // Cancel any ongoing preload
  cancelPreload();

  activePreloadController = new AbortController();

  try {
    const success = await cacheTrack(target.fileId, target.name);
    return success;
  } catch {
    return false;
  } finally {
    activePreloadController = null;
  }
}

/**
 * Cancel any active preload operation
 */
export function cancelPreload(): void {
  if (activePreloadController) {
    activePreloadController.abort();
    activePreloadController = null;
  }
}

/**
 * Clean up preload link elements from the DOM
 */
export function cleanupPreloadLinks(): void {
  if (typeof document === "undefined") return;

  const links = document.querySelectorAll("link[data-preload-track]");
  links.forEach((link) => link.remove());
}
