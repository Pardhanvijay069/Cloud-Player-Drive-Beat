/**
 * Streaming Module — Barrel export
 *
 * Centralizes all streaming utilities for clean imports:
 *   import { isTrackCached, preloadNextTrackMetadata } from "@/lib/streaming";
 */

export {
  isTrackCached,
  cacheTrack,
  getCachedTrack,
  uncacheTrack,
  getCacheStats,
  clearAudioCache,
} from "./audio-cache";

export {
  preloadNextTrackMetadata,
  preloadFullTrack,
  cancelPreload,
  cleanupPreloadLinks,
} from "./preloader";
