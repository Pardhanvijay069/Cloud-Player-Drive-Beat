"use client";

import { useEffect, useState, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DriveAudioFile } from "@/lib/google-drive";
import type { BufferState } from "@/hooks/use-buffer-state";
import { parseTrackMetadata } from "@/lib/music-metadata";

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
  bufferState?: BufferState;
  isCached?: boolean;
  isCaching?: boolean;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Soft vinyl/disk SVG artwork placeholder with rotation */
function VinylDisk({ isPlaying, small = false }: { isPlaying: boolean; small?: boolean }) {
  const size = small ? 44 : 52;
  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 transition-all duration-500 ${isPlaying ? "vinyl-spinning" : "vinyl-paused"}`}
      style={{
        width: size,
        height: size,
        boxShadow: isPlaying
          ? "0 0 20px rgba(167,139,250,0.35), 0 4px 16px rgba(0,0,0,0.5)"
          : "0 4px 16px rgba(0,0,0,0.4)",
        animation: isPlaying ? "vinyl-spin 3s linear infinite" : undefined,
      }}
    >
      {/* Disk body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(circle at 30% 30%, #2a1f4f, #0d0d1a)" }}
      />
      {/* Grooves */}
      <div className="absolute inset-0 rounded-full" style={{
        background: `
          repeating-radial-gradient(circle at center,
            transparent 0px,
            transparent 3px,
            rgba(255,255,255,0.03) 3px,
            rgba(255,255,255,0.03) 4px
          )
        `
      }} />
      {/* Center label */}
      <div
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: size * 0.35,
            height: size * 0.35,
            background: "radial-gradient(circle at 35% 35%, rgba(167,139,250,0.5), rgba(103,232,249,0.3))",
          }}
        >
          <div
            className="rounded-full"
            style={{
              width: size * 0.10,
              height: size * 0.10,
              background: "#0d0d1a",
            }}
          />
        </div>
      </div>
      {/* Light sheen */}
      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)",
        }}
      />
    </div>
  );
}

function PlayerBarInner({
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
  onNext,
  bufferState,
  isCached = false,
  isCaching = false,
}: Props) {
  const [seekValue, setSeekValue] = useState(progress);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const seekBarRef = useRef<HTMLDivElement>(null);
  const volumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!isSeeking) setSeekValue(progress);
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

  const meta = track ? parseTrackMetadata(track.name) : null;
  const displayName = meta?.title ?? "No track selected";
  const artistName = meta?.artist;
  const isBuffering = bufferState?.isBuffering ?? false;

  return (
    <motion.footer
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.19, 1, 0.22, 1] }}
      className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-2 sm:px-4 sm:pb-4"
    >
      <div className="mx-auto max-w-5xl player-glass rounded-2xl sm:rounded-3xl overflow-hidden">
        {/* Progress track — full width at top */}
        <div
          ref={seekBarRef}
          className="relative h-1 w-full cursor-pointer touch-none group/seek"
          style={{ background: "rgba(255,255,255,0.06)" }}
          onMouseDown={handleSeekStart}
          onTouchStart={handleSeekStart}
          onMouseMove={handleSeekMove}
          onTouchMove={handleSeekMove}
          onMouseUp={handleSeekEnd}
          onTouchEnd={handleSeekEnd}
        >
          {/* Buffer ranges */}
          {bufferState?.ranges.map((range, i) => (
            <div
              key={`buffer-${i}`}
              className="absolute inset-y-0 rounded-full transition-all duration-500"
              style={{
                left: `${range.startPct}%`,
                width: `${range.endPct - range.startPct}%`,
                background: "rgba(167,139,250,0.12)",
              }}
            />
          ))}
          {/* Fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full seek-fill"
            style={{ width: `${seekValue}%` }}
            transition={{ duration: isSeeking ? 0 : 0.1 }}
          />
          {/* Hover expand */}
          <div className="absolute inset-0 transition-all duration-200 group-hover/seek:h-2 -translate-y-[0px] group-hover/seek:-translate-y-[2px] rounded-full" />
          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-lg opacity-0 group-hover/seek:opacity-100 transition-all duration-200"
            style={{
              left: `calc(${seekValue}% - 7px)`,
              boxShadow: "0 0 0 3px rgba(167,139,250,0.3), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          />
        </div>

        {/* Main controls area */}
        <div className="flex items-center gap-3 px-3 py-2.5 sm:px-5 sm:py-3.5">
          {/* Vinyl + Track info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Vinyl disk */}
            <VinylDisk isPlaying={isPlaying && !!track} small />

            {/* Track info */}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={track?.id ?? "empty"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="truncate text-[13px] sm:text-sm font-semibold text-primary-text leading-tight">
                      {displayName}
                    </p>
                    {isBuffering && isPlaying && (
                      <span className="inline-block h-3 w-3 shrink-0 rounded-full border-[1.5px] border-accent/30 border-t-accent animate-spin" />
                    )}
                    {isCached && (
                      <span title="Cached offline" className="shrink-0 text-accent/50">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </span>
                    )}
                    {isCaching && !isCached && (
                      <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-accent/20 border-t-accent/50 animate-spin" title="Caching..." />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {artistName && artistName !== "Unknown Artist" && (
                      <span className="truncate text-[11px] text-secondary-text">{artistName}</span>
                    )}
                    <span className="text-[11px] text-secondary-text/40 shrink-0">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Controls — center */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Previous */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-secondary-text transition-colors hover:text-primary-text"
              style={{ background: "rgba(255,255,255,0.04)" }}
              onClick={onPrevious}
              type="button"
              aria-label="Previous track"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
              </svg>
            </motion.button>

            {/* Play/Pause — main CTA */}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-white relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))",
                boxShadow: isPlaying
                  ? "0 0 24px rgba(167,139,250,0.5), 0 4px 16px rgba(0,0,0,0.3)"
                  : "0 4px 16px rgba(0,0,0,0.3)",
                transition: "box-shadow 0.3s ease",
              }}
              onClick={onTogglePlay}
              type="button"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {/* Glow pulse when playing */}
              {isPlaying && (
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ background: "radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)" }}
                />
              )}
              <AnimatePresence mode="wait">
                <motion.div
                  key={isBuffering && isPlaying ? "buffering" : isPlaying ? "pause" : "play"}
                  initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="relative z-10"
                >
                  {isBuffering && isPlaying ? (
                    <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : isPlaying ? (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1.5" />
                      <rect x="14" y="4" width="4" height="16" rx="1.5" />
                    </svg>
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 2 }}>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            {/* Next */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl text-secondary-text transition-colors hover:text-primary-text"
              style={{ background: "rgba(255,255,255,0.04)" }}
              onClick={onNext}
              type="button"
              aria-label="Next track"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </motion.button>
          </div>

          {/* Volume — desktop */}
          <div
            className="hidden sm:flex items-center gap-2 flex-[0.5] justify-end"
            onMouseEnter={handleVolumeHover}
            onMouseLeave={handleVolumeLeave}
          >
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-text transition-colors hover:text-primary-text shrink-0"
              aria-label="Volume"
              onClick={() => setShowVolume(!showVolume)}
            >
              {volume === 0 ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : volume < 0.5 ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 010 7.07" />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
                </svg>
              )}
            </button>
            <AnimatePresence>
              {showVolume && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 72, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <input
                    aria-label="Volume"
                    className="volume-slider h-0.5 w-full cursor-pointer appearance-none rounded-full"
                    style={{ background: `linear-gradient(to right, var(--color-accent) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)` }}
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

export const PlayerBar = memo(PlayerBarInner);
