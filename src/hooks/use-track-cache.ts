/**
 * useTrackCache Hook
 *
 * Provides a simple interface to cache the currently playing track
 * and check cache status. Auto-caches tracks after a few seconds
 * of playback to avoid caching tracks that are immediately skipped.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cacheTrack, isTrackCached } from "@/lib/streaming";
import type { DriveAudioFile } from "@/lib/google-drive";

type TrackCacheState = {
  /** Whether the current track is cached */
  isCached: boolean;
  /** Whether caching is in progress */
  isCaching: boolean;
};

/** Wait 5 seconds of playback before caching (avoids caching skipped tracks) */
const AUTO_CACHE_DELAY = 5_000;

export function useTrackCache(
  track: DriveAudioFile | undefined,
  isPlaying: boolean
): TrackCacheState {
  const [isCached, setIsCached] = useState(false);
  const [isCaching, setIsCaching] = useState(false);
  const cacheTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Check cache status when track changes
  useEffect(() => {
    if (!track) {
      setIsCached(false);
      return;
    }

    let active = true;

    void isTrackCached(track.id).then((cached) => {
      if (active) setIsCached(cached);
    });

    return () => {
      active = false;
    };
  }, [track?.id]);

  // Auto-cache after 5s of playback
  useEffect(() => {
    if (cacheTimerRef.current) {
      clearTimeout(cacheTimerRef.current);
    }

    if (!track || !isPlaying || isCached) return;

    cacheTimerRef.current = setTimeout(async () => {
      if (!track) return;

      setIsCaching(true);
      const success = await cacheTrack(track.id, track.name);
      setIsCached(success);
      setIsCaching(false);
    }, AUTO_CACHE_DELAY);

    return () => {
      if (cacheTimerRef.current) {
        clearTimeout(cacheTimerRef.current);
      }
    };
  }, [track?.id, isPlaying, isCached]);

  return { isCached, isCaching };
}
