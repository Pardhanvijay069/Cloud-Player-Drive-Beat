"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DriveAudioFile } from "@/lib/google-drive";

type Props = {
  track?: DriveAudioFile;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onSeek: (value: number) => void;
  onVolumeChange: (value: number) => void;
  onPrevious: () => void;
  onNext: () => void;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayerBar({
  track,
  isPlaying,
  progress,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onPrevious,
  onNext
}: Props) {
  const [seekValue, setSeekValue] = useState(progress);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(progress);
    }
  }, [progress, isSeeking]);

  const handleSeekStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    const bar = seekBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSeekValue(pct);
  }, []);

  const handleSeekMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    const bar = seekBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pct = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSeekValue(pct);
  }, [isSeeking]);

  const handleSeekEnd = useCallback(() => {
    if (isSeeking) {
      onSeek(seekValue);
      setIsSeeking(false);
    }
  }, [isSeeking, seekValue, onSeek]);

  useEffect(() => {
    if (!isSeeking) return;
    const handleMouseUp = () => handleSeekEnd();
    const handleMouseMove = (e: MouseEvent) => {
      const bar = seekBarRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      setSeekValue(pct);
    };
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isSeeking, handleSeekEnd]);

  const handleVolumeHover = () => {
    if (volumeTimeoutRef.current) clearTimeout(volumeTimeoutRef.current);
    setShowVolume(true);
  };

  const handleVolumeLeave = () => {
    volumeTimeoutRef.current = setTimeout(() => setShowVolume(false), 800);
  };

  const displayName = track?.name?.replace(/\.[^/.]+$/, "") ?? "Select a track";

  return (
    <motion.footer
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto max-w-5xl player-glass rounded-2xl border border-border-subtle p-3 sm:p-4 shadow-[0_-8px_40px_rgba(0,0,0,0.3)]">
        {/* Seek bar - full width at top */}
        <div
          ref={seekBarRef}
          className="relative h-1.5 w-full rounded-full bg-surface-elevated/80 cursor-pointer mb-3 group/seek touch-none"
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onMouseMove={handleSeekMove}
          onTouchMove={handleSeekMove}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-accent-secondary transition-all duration-75"
            style={{ width: `${seekValue}%` }}
          />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity duration-200"
            style={{ left: `calc(${seekValue}% - 7px)` }}
          />
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Track info */}
          <div className="min-w-0 flex-1 sm:flex-[1.2]">
            <AnimatePresence mode="wait">
              <motion.div
                key={track?.id ?? "empty"}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <p className="truncate text-sm font-medium text-primary-text">{displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-secondary-text">{formatTime(currentTime)}</span>
                  <span className="text-[11px] text-secondary-text/40">/</span>
                  <span className="text-[11px] text-secondary-text">{formatTime(duration)}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary-text transition-colors hover:text-primary-text hover:bg-surface-elevated/60"
              onClick={onPrevious}
              type="button"
              aria-label="Previous track"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
              </svg>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-secondary text-white shadow-lg shadow-accent/25 transition-shadow hover:shadow-accent/40"
              onClick={onTogglePlay}
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={isPlaying ? "pause" : "play"}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1"/>
                      <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary-text transition-colors hover:text-primary-text hover:bg-surface-elevated/60"
              onClick={onNext}
              type="button"
              aria-label="Next track"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
              </svg>
            </motion.button>
          </div>

          {/* Volume (desktop) */}
          <div
            className="hidden sm:flex items-center gap-2 flex-[0.6] justify-end"
            onMouseEnter={handleVolumeHover}
            onMouseLeave={handleVolumeLeave}
          >
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition-colors hover:text-primary-text"
              aria-label="Volume"
              onClick={() => setShowVolume(!showVolume)}
            >
              {volume === 0 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <line x1="23" y1="9" x2="17" y2="15"/>
                  <line x1="17" y1="9" x2="23" y2="15"/>
                </svg>
              ) : volume < 0.5 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M15.54 8.46a5 5 0 010 7.07"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/>
                </svg>
              )}
            </button>
            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 80, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <input
                    aria-label="Volume"
                    className="volume-slider h-1 w-full cursor-pointer appearance-none rounded-full bg-surface-elevated"
                    max={1}
                    min={0}
                    onChange={(e) => onVolumeChange(Number(e.target.value))}
                    step={0.01}
                    type="range"
                    value={volume}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
