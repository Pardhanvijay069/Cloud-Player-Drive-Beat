/**
 * useBufferState Hook
 *
 * Tracks the HTML5 audio element's buffered time ranges and provides
 * normalized data for rendering a professional buffer indicator.
 *
 * The browser's <audio> element natively handles Range requests —
 * it sends `Range: bytes=X-Y` headers and processes 206 responses.
 * This hook reads the resulting TimeRanges to visualize buffer state.
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** A single buffered range as percentage of total duration */
export type BufferRange = {
  startPct: number;
  endPct: number;
};

export type BufferState = {
  /** Array of buffered ranges as percentages (0-100) */
  ranges: BufferRange[];
  /** Total buffered percentage */
  bufferedPct: number;
  /** Whether the audio is currently waiting for data */
  isBuffering: boolean;
  /** Whether audio has enough data to play without interruption */
  hasEnoughData: boolean;
};

const INITIAL_STATE: BufferState = {
  ranges: [],
  bufferedPct: 0,
  isBuffering: false,
  hasEnoughData: false,
};

/**
 * Reads TimeRanges from an audio element and normalizes to percentages
 */
function extractBufferRanges(audio: HTMLAudioElement): BufferRange[] {
  const duration = audio.duration;
  if (!Number.isFinite(duration) || duration === 0) return [];

  const ranges: BufferRange[] = [];

  for (let i = 0; i < audio.buffered.length; i++) {
    const start = audio.buffered.start(i);
    const end = audio.buffered.end(i);
    ranges.push({
      startPct: (start / duration) * 100,
      endPct: (end / duration) * 100,
    });
  }

  return ranges;
}

/**
 * Calculate total buffered percentage
 */
function totalBufferedPct(audio: HTMLAudioElement): number {
  const duration = audio.duration;
  if (!Number.isFinite(duration) || duration === 0) return 0;

  let total = 0;
  for (let i = 0; i < audio.buffered.length; i++) {
    total += audio.buffered.end(i) - audio.buffered.start(i);
  }

  return Math.min(100, (total / duration) * 100);
}

export function useBufferState(
  audioElement: HTMLAudioElement | null
): BufferState {
  const [state, setState] = useState<BufferState>(INITIAL_STATE);
  const rafRef = useRef<number>(0);

  const updateBuffer = useCallback(() => {
    if (!audioElement) return;

    const ranges = extractBufferRanges(audioElement);
    const bufferedPct = totalBufferedPct(audioElement);

    // readyState: 0=HAVE_NOTHING, 1=HAVE_METADATA, 2=HAVE_CURRENT_DATA,
    //             3=HAVE_FUTURE_DATA, 4=HAVE_ENOUGH_DATA
    const hasEnoughData = audioElement.readyState >= 3;

    setState((prev) => {
      // Avoid unnecessary re-renders by checking if values actually changed
      if (
        prev.bufferedPct === bufferedPct &&
        prev.ranges.length === ranges.length &&
        prev.hasEnoughData === hasEnoughData &&
        !prev.isBuffering
      ) {
        return prev;
      }

      return { ranges, bufferedPct, isBuffering: prev.isBuffering, hasEnoughData };
    });
  }, [audioElement]);

  useEffect(() => {
    if (!audioElement) {
      setState(INITIAL_STATE);
      return;
    }

    // Update buffer state on relevant audio events
    const onProgress = () => updateBuffer();
    const onLoadedData = () => updateBuffer();
    const onCanPlay = () => updateBuffer();

    const onWaiting = () => {
      setState((prev) => ({ ...prev, isBuffering: true }));
    };

    const onPlaying = () => {
      setState((prev) => ({ ...prev, isBuffering: false }));
      updateBuffer();
    };

    const onSeeked = () => {
      updateBuffer();
    };

    audioElement.addEventListener("progress", onProgress);
    audioElement.addEventListener("loadeddata", onLoadedData);
    audioElement.addEventListener("canplay", onCanPlay);
    audioElement.addEventListener("waiting", onWaiting);
    audioElement.addEventListener("playing", onPlaying);
    audioElement.addEventListener("seeked", onSeeked);

    // Poll buffer state every 500ms as a fallback
    // (some browsers don't fire progress events consistently)
    const interval = setInterval(updateBuffer, 500);

    return () => {
      audioElement.removeEventListener("progress", onProgress);
      audioElement.removeEventListener("loadeddata", onLoadedData);
      audioElement.removeEventListener("canplay", onCanPlay);
      audioElement.removeEventListener("waiting", onWaiting);
      audioElement.removeEventListener("playing", onPlaying);
      audioElement.removeEventListener("seeked", onSeeked);
      clearInterval(interval);
      cancelAnimationFrame(rafRef.current);
    };
  }, [audioElement, updateBuffer]);

  return state;
}
