/**
 * useAudioPreloader Hook
 *
 * Manages intelligent preloading of the next track in the playlist.
 * Triggers preload at optimal moments during playback.
 */

"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  preloadNextTrackMetadata,
  preloadFullTrack,
  cancelPreload,
  cleanupPreloadLinks,
} from "@/lib/streaming";
import type { DriveAudioFile } from "@/lib/google-drive";

type PreloaderOptions = {
  /** Current track index */
  currentIndex: number;
  /** All tracks in the playlist */
  tracks: DriveAudioFile[];
  /** Current playback progress (0-100) */
  progress: number;
  /** Whether audio is currently playing */
  isPlaying: boolean;
};

/** Threshold: start full preload when track is 75% complete */
const PRELOAD_THRESHOLD = 75;

/** Threshold: preload metadata when track is 20% complete */
const METADATA_PRELOAD_THRESHOLD = 20;

export function useAudioPreloader({
  currentIndex,
  tracks,
  progress,
  isPlaying,
}: PreloaderOptions): void {
  const hasPreloadedMetadata = useRef(false);
  const hasPreloadedFull = useRef(false);
  const lastPreloadedIndex = useRef(-1);

  // Get next track info
  const nextTrack =
    currentIndex >= 0 && currentIndex < tracks.length - 1
      ? tracks[currentIndex + 1]
      : null;

  // Reset preload flags when track changes
  useEffect(() => {
    if (currentIndex !== lastPreloadedIndex.current) {
      hasPreloadedMetadata.current = false;
      hasPreloadedFull.current = false;
      lastPreloadedIndex.current = currentIndex;
      cancelPreload();
    }
  }, [currentIndex]);

  // Preload metadata early (at 20% playback)
  useEffect(() => {
    if (
      !isPlaying ||
      !nextTrack ||
      hasPreloadedMetadata.current ||
      progress < METADATA_PRELOAD_THRESHOLD
    ) {
      return;
    }

    hasPreloadedMetadata.current = true;
    preloadNextTrackMetadata(nextTrack.id);
  }, [isPlaying, nextTrack, progress]);

  // Full preload at 75% playback
  useEffect(() => {
    if (
      !isPlaying ||
      !nextTrack ||
      hasPreloadedFull.current ||
      progress < PRELOAD_THRESHOLD
    ) {
      return;
    }

    hasPreloadedFull.current = true;

    void preloadFullTrack({
      fileId: nextTrack.id,
      name: nextTrack.name,
    });
  }, [isPlaying, nextTrack, progress]);

  // Clean up preload links when component unmounts
  useEffect(() => {
    return () => {
      cleanupPreloadLinks();
      cancelPreload();
    };
  }, []);
}
