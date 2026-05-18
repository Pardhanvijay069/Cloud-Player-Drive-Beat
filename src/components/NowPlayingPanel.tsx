"use client";

import { useCallback, useEffect, useRef, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DriveAudioFile } from "@/lib/google-drive";
import type { BufferState } from "@/hooks/use-buffer-state";
import { parseTrackMetadata } from "@/lib/music-metadata";
import { useTheme } from "@/components/providers/theme-provider";

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
  trackIndex?: number;
  trackTotal?: number;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Generate a soft gradient from track name for background */
function getTrackGradient(name: string): [string, string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 60) % 360;
  const h3 = (h1 + 120) % 360;
  return [
    `hsl(${h1}, 35%, 18%)`,
    `hsl(${h2}, 30%, 12%)`,
    `hsl(${h3}, 25%, 8%)`,
  ];
}

/** Immersive vinyl disk with grooves + sheen */
function VinylDisk({ isPlaying, trackKey }: { isPlaying: boolean; trackKey: string }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 260, height: 260 }}>
      {/* Outer glow ring */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={isPlaying
          ? { boxShadow: ["0 0 40px rgba(167,139,250,0.2)", "0 0 80px rgba(167,139,250,0.35)", "0 0 40px rgba(167,139,250,0.2)"] }
          : { boxShadow: "0 0 24px rgba(0,0,0,0.6)" }
        }
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Vinyl disk */}
      <AnimatePresence mode="wait">
        <motion.div
          key={trackKey}
          initial={{ scale: 0.85, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            animation: isPlaying ? "vinyl-spin 3s linear infinite" : undefined,
            boxShadow: "0 8px 40px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)",
          }}
        >
          {/* Disk body */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 30%, #2a1a4e, #100c1e 60%, #050308)" }}
          />
          {/* Groove rings */}
          <div className="absolute inset-0 rounded-full" style={{
            background: `repeating-radial-gradient(circle at center,
              transparent 0px,
              transparent 5px,
              rgba(255,255,255,0.025) 5px,
              rgba(255,255,255,0.025) 6px
            )`
          }} />
          {/* Label area */}
          <div
            className="absolute rounded-full flex items-center justify-center overflow-hidden"
            style={{
              top: "50%", left: "50%",
              transform: "translate(-50%, -50%)",
              width: "36%", height: "36%",
              background: "radial-gradient(circle at 40% 35%, rgba(167,139,250,0.6), rgba(103,232,249,0.3) 60%, rgba(60,40,100,0.8))",
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.4)",
            }}
          >
            <div className="rounded-full" style={{
              width: "22%", height: "22%",
              background: "#0a0612",
              boxShadow: "0 0 0 2px rgba(255,255,255,0.08)"
            }} />
          </div>
          {/* Sheen overlay */}
          <div className="absolute inset-0 rounded-full pointer-events-none" style={{
            background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)"
          }} />
        </motion.div>
      </AnimatePresence>

      {/* Center pin shadow */}
      <div className="absolute rounded-full" style={{
        width: 8, height: 8,
        background: "rgba(255,255,255,0.15)",
        boxShadow: "0 0 0 3px rgba(255,255,255,0.05)",
        zIndex: 10,
      }} />
    </div>
  );
}

/** Seek bar with buffer visualization */
function SeekBar({
  progress,
  seekValue,
  isSeeking,
  bufferState,
  onSeekStart,
  onSeekMove,
  onSeekEnd,
  seekBarRef,
}: {
  progress: number;
  seekValue: number;
  isSeeking: boolean;
  bufferState?: BufferState;
  onSeekStart: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onSeekMove: (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => void;
  onSeekEnd: () => void;
  seekBarRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={seekBarRef}
      className="relative h-1.5 w-full rounded-full cursor-pointer group/seek touch-none"
      style={{ background: "rgba(255,255,255,0.08)" }}
      onMouseDown={onSeekStart}
      onTouchStart={onSeekStart}
      onMouseMove={onSeekMove}
      onTouchMove={onSeekMove}
      onMouseUp={onSeekEnd}
      onTouchEnd={onSeekEnd}
    >
      {/* Buffer */}
      {bufferState?.ranges.map((range, i) => (
        <div
          key={`buf-${i}`}
          className="absolute inset-y-0 rounded-full"
          style={{
            left: `${range.startPct}%`,
            width: `${range.endPct - range.startPct}%`,
            background: "rgba(167,139,250,0.15)",
          }}
        />
      ))}
      {/* Progress */}
      <div
        className="absolute inset-y-0 left-0 rounded-full"
        style={{
          width: `${seekValue}%`,
          background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-secondary))",
          boxShadow: "0 0 8px rgba(167,139,250,0.5)",
          transition: isSeeking ? "none" : "width 0.1s linear",
        }}
      />
      {/* Thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 group-hover/seek:opacity-100 transition-all duration-200"
        style={{
          width: 14, height: 14,
          left: `calc(${seekValue}% - 7px)`,
          boxShadow: "0 0 0 3px rgba(167,139,250,0.35), 0 2px 8px rgba(0,0,0,0.4)",
        }}
      />
    </div>
  );
}

function NowPlayingPanelInner({
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
  trackIndex,
  trackTotal,
}: Props) {
  const { theme } = useTheme();
  const [seekValue, setSeekValue] = useState(progress);
  const [isSeeking, setIsSeeking] = useState(false);
  const seekBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isSeeking) setSeekValue(progress);
  }, [progress, isSeeking]);

  const handleSeekStart = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    setIsSeeking(true);
    const bar = seekBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setSeekValue(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  const handleSeekMove = useCallback((e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (!isSeeking) return;
    const bar = seekBarRef.current;
    if (!bar) return;
    const rect = bar.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    setSeekValue(Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100)));
  }, [isSeeking]);

  const handleSeekEnd = useCallback(() => {
    if (isSeeking) { onSeek(seekValue); setIsSeeking(false); }
  }, [isSeeking, seekValue, onSeek]);

  useEffect(() => {
    if (!isSeeking) return;
    const up = () => handleSeekEnd();
    const move = (e: MouseEvent) => {
      const bar = seekBarRef.current;
      if (!bar) return;
      const rect = bar.getBoundingClientRect();
      setSeekValue(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
    };
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);
    return () => { window.removeEventListener("mouseup", up); window.removeEventListener("mousemove", move); };
  }, [isSeeking, handleSeekEnd]);

  const meta = track ? parseTrackMetadata(track.name) : null;
  const trackTitle = meta?.title ?? "Nothing playing";
  const trackArtist = meta?.artist ?? "";
  const isBuffering = bufferState?.isBuffering ?? false;
  const [g1, g2, g3] = track
    ? getTrackGradient(track.name)
    : theme === "dark"
      ? ["#1a1a2e", "#0f0f1a", "#080810"]
      : ["#e0e7ff", "#dbeafe", "#f8fafc"];

  return (
    <div className="relative flex flex-col h-full overflow-hidden rounded-2xl">
      {/* Ambient background — adapts to track */}
      <AnimatePresence mode="wait">
        <motion.div
          key={track?.id ?? "empty"}
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div className="absolute inset-0" style={{
            background: `radial-gradient(ellipse at 30% 20%, ${g1} 0%, transparent 60%),
                         radial-gradient(ellipse at 70% 80%, ${g2} 0%, transparent 60%),
                         radial-gradient(ellipse at 50% 50%, ${g3} 0%, transparent 80%)`
          }} />
          {/* Base dark overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: theme === "dark"
                ? "rgba(8,10,16,0.75)"
                : "rgba(245,247,255,0.75)",
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Glass surface */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
        background: "var(--color-surface-glass)",
        border: "1px solid var(--color-border-subtle)",
        backdropFilter: "blur(2px)",
      }} />

      {/* ─── Content ─── */}
      <div className="relative z-10 flex flex-col h-full px-6 py-6">
        {/* Top label */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] uppercase tracking-[0.3em] text-secondary-text font-medium">
            Now Playing
          </p>
          {trackTotal !== undefined && trackIndex !== undefined && trackIndex >= 0 && (
            <p className="text-[10px] text-secondary-text/50 tabular-nums">
              {trackIndex + 1} / {trackTotal}
            </p>
          )}
        </div>

        {/* Vinyl artwork — centered, takes most vertical space */}
        <div className="flex-1 flex items-center justify-center py-4">
          <AnimatePresence mode="wait">
            {track ? (
              <motion.div
                key={track.id}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="animate-float"
              >
                <VinylDisk isPlaying={isPlaying} trackKey={track.id} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4"
              >
                {/* Empty state placeholder */}
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 200, height: 200,
                    background: theme === "dark"
                      ? "radial-gradient(circle at 35% 35%, rgba(167,139,250,0.08), rgba(0,0,0,0.4))"
                      : "radial-gradient(circle at 35% 35%, rgba(124,58,237,0.1), rgba(255,255,255,0.6))",
                    border: "1px solid var(--color-border-subtle)",
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="text-secondary-text/20">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <p className="text-sm text-secondary-text/40">Select a track to begin</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Track info */}
        <div className="mt-4 mb-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={track?.id ?? "empty"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <h3 className="text-lg font-bold text-primary-text tracking-tight truncate max-w-full">
                  {trackTitle}
                </h3>
                {isBuffering && isPlaying && (
                  <span className="inline-block h-3 w-3 rounded-full border-[1.5px] border-accent/30 border-t-accent animate-spin shrink-0" />
                )}
                {isCached && (
                  <span className="shrink-0 text-accent/50" title="Cached">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                  </span>
                )}
                {isCaching && !isCached && (
                  <span className="inline-block h-2.5 w-2.5 rounded-full border border-accent/20 border-t-accent/50 animate-spin shrink-0" title="Caching..." />
                )}
              </div>
              {trackArtist && trackArtist !== "Unknown Artist" && (
                <p className="text-sm text-secondary-text">{trackArtist}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Seek bar + timestamps */}
        <div className="mb-4">
          <SeekBar
            progress={progress}
            seekValue={seekValue}
            isSeeking={isSeeking}
            bufferState={bufferState}
            onSeekStart={handleSeekStart}
            onSeekMove={handleSeekMove}
            onSeekEnd={handleSeekEnd}
            seekBarRef={seekBarRef}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[11px] text-secondary-text/60 tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-[11px] text-secondary-text/60 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-5">
          {/* Previous */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={onPrevious}
            disabled={!track}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary-text transition-all hover:text-primary-text disabled:opacity-30"
            style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-subtle)" }}
            type="button"
            aria-label="Previous"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </motion.button>

          {/* Play / Pause */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onTogglePlay}
            disabled={!track}
            className="relative flex h-16 w-16 items-center justify-center rounded-full text-white disabled:opacity-30 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))",
              boxShadow: isPlaying
                ? "0 0 32px rgba(167,139,250,0.6), 0 8px 24px rgba(0,0,0,0.4)"
                : "0 8px 24px rgba(0,0,0,0.4)",
              transition: "box-shadow 0.4s ease",
            }}
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {/* Pulse ring */}
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "radial-gradient(circle, rgba(167,139,250,0.4), transparent 70%)" }}
              />
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={isBuffering && isPlaying ? "buf" : isPlaying ? "pause" : "play"}
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5, opacity: 0, rotate: 10 }}
                transition={{ duration: 0.18 }}
                className="relative z-10"
              >
                {isBuffering && isPlaying ? (
                  <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1.5" />
                    <rect x="14" y="4" width="4" height="16" rx="1.5" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          {/* Next */}
          <motion.button
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={onNext}
            disabled={!track}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary-text transition-all hover:text-primary-text disabled:opacity-30"
            style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-subtle)" }}
            type="button"
            aria-label="Next"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </motion.button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-secondary-text/50 shrink-0">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          </svg>
          <div className="flex-1 relative">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full h-0.5 cursor-pointer appearance-none rounded-full"
              style={{
                background: `linear-gradient(to right, var(--color-accent) ${volume * 100}%, var(--color-border-default) ${volume * 100}%)`,
              }}
              aria-label="Volume"
            />
          </div>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-secondary-text/50 shrink-0">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export const NowPlayingPanel = memo(NowPlayingPanelInner);
