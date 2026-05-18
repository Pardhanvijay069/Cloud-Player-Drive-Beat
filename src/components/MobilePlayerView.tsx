"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  onClose: () => void;
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0:00";
  const m = Math.floor(value / 60);
  const s = Math.floor(value % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getTrackGradient(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const h1 = Math.abs(hash) % 360;
  const h2 = (h1 + 70) % 360;
  return [`hsl(${h1}, 40%, 20%)`, `hsl(${h2}, 35%, 10%)`];
}

export function MobilePlayerView({
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
  isCached,
  isCaching,
  trackIndex,
  trackTotal,
  onClose,
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
  const [g1, g2] = track
    ? getTrackGradient(track.name)
    : theme === "dark"
      ? ["#1a1530", "#0a0812"]
      : ["#dbeafe", "#e0e7ff"];

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      className="fixed inset-0 z-[60] flex flex-col overflow-hidden"
      style={{
        background: theme === "dark"
          ? `linear-gradient(180deg, ${g1} 0%, ${g2} 40%, #060810 100%)`
          : `linear-gradient(180deg, ${g1} 0%, ${g2} 42%, #f8fafc 100%)`,
      }}
    >
      {/* Grid overlay for texture */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Ambient orbs */}
      <div className="absolute top-[10%] left-[10%] w-64 h-64 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${g1} 0%, transparent 70%)`, filter: "blur(60px)", opacity: 0.6 }} />
      <div className="absolute bottom-[20%] right-[5%] w-48 h-48 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(103,232,249,0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-5 pt-safe-top pt-12 pb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-subtle)" }}
          type="button"
          aria-label="Close player"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </motion.button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-secondary-text">Now Playing</p>
          {trackTotal !== undefined && trackIndex !== undefined && trackIndex >= 0 && (
            <p className="text-[10px] text-secondary-text/40 tabular-nums">{trackIndex + 1} / {trackTotal}</p>
          )}
        </div>
        <div className="w-10" />
      </div>

      {/* Vinyl artwork */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-8">
        <AnimatePresence mode="wait">
          {track ? (
            <motion.div
              key={track.id}
              initial={{ scale: 0.7, opacity: 0, rotate: -20 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.7, opacity: 0, rotate: 20 }}
              transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
              className="animate-float"
            >
              {/* Large vinyl for mobile */}
              <div
                className="relative rounded-full overflow-hidden"
                style={{
                  width: "min(72vw, 300px)",
                  height: "min(72vw, 300px)",
                  animation: isPlaying ? "vinyl-spin 3s linear infinite" : undefined,
                  boxShadow: isPlaying
                    ? "0 0 60px rgba(167,139,250,0.4), 0 20px 60px rgba(0,0,0,0.8)"
                    : "0 20px 60px rgba(0,0,0,0.7)",
                }}
              >
                <div className="absolute inset-0 rounded-full" style={{
                  background: "radial-gradient(circle at 35% 30%, #2a1a4e, #100c1e 60%, #050308)"
                }} />
                <div className="absolute inset-0 rounded-full" style={{
                  background: `repeating-radial-gradient(circle at center,
                    transparent 0px, transparent 5px,
                    rgba(255,255,255,0.03) 5px, rgba(255,255,255,0.03) 6px
                  )`
                }} />
                {/* Center label */}
                <div className="absolute rounded-full flex items-center justify-center"
                  style={{
                    top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: "36%", height: "36%",
                    background: "radial-gradient(circle at 40% 35%, rgba(167,139,250,0.6), rgba(103,232,249,0.3) 60%, rgba(60,40,100,0.8))",
                  }}
                >
                  <div className="rounded-full" style={{ width: "22%", height: "22%", background: "#0a0612" }} />
                </div>
                {/* Sheen */}
                <div className="absolute inset-0 rounded-full" style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, transparent 50%)"
                }} />
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full flex items-center justify-center"
                style={{
                  width: "min(72vw, 280px)", height: "min(72vw, 280px)",
                  background: "rgba(167,139,250,0.05)",
                  border: "1px dashed rgba(167,139,250,0.15)",
                }}
              >
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-secondary-text/20">
                  <path d="M9 18V5l12-2v13" />
                  <circle cx="6" cy="18" r="3" />
                  <circle cx="18" cy="16" r="3" />
                </svg>
              </div>
              <p className="text-sm text-secondary-text/30">Select a track</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom controls */}
      <div className="relative z-10 px-6 pb-safe-bottom pb-8">
        {/* Track info */}
        <div className="text-center mb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={track?.id ?? "empty"}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-xl font-bold text-primary-text tracking-tight truncate">
                  {trackTitle}
                </h3>
                {isBuffering && isPlaying && (
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-accent/30 border-t-accent animate-spin shrink-0" />
                )}
                {isCached && <span className="shrink-0 text-accent/60" title="Cached">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                </span>}
              </div>
              {trackArtist && trackArtist !== "Unknown Artist" && (
                <p className="mt-1 text-sm text-secondary-text">{trackArtist}</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Seek bar */}
        <div className="mb-2">
          <div
            ref={seekBarRef}
            className="relative h-1.5 w-full rounded-full cursor-pointer touch-none"
            style={{ background: "var(--color-border-default)" }}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onMouseMove={handleSeekMove}
            onTouchMove={handleSeekMove}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
          >
            {bufferState?.ranges.map((r, i) => (
              <div key={i} className="absolute inset-y-0 rounded-full"
                style={{ left: `${r.startPct}%`, width: `${r.endPct - r.startPct}%`, background: "rgba(167,139,250,0.12)" }}
              />
            ))}
            <div className="absolute inset-y-0 left-0 rounded-full"
              style={{
                width: `${seekValue}%`,
                background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-secondary))",
                transition: isSeeking ? "none" : "width 0.1s linear",
              }}
            />
            {/* Large thumb for touch */}
            <div className="absolute top-1/2 -translate-y-1/2 rounded-full bg-white"
              style={{
                width: 18, height: 18,
                left: `calc(${seekValue}% - 9px)`,
                boxShadow: "0 0 0 4px rgba(var(--accent-rgb),0.25), 0 2px 8px rgba(0,0,0,0.25)",
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-secondary-text/50 tabular-nums">{formatTime(currentTime)}</span>
            <span className="text-xs text-secondary-text/50 tabular-nums">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Playback controls */}
        <div className="flex items-center justify-center gap-5 mt-4 mb-4">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onPrevious}
            disabled={!track}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-secondary-text disabled:opacity-30"
            style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-subtle)" }}
            type="button" aria-label="Previous"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
            </svg>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={onTogglePlay}
            disabled={!track}
            className="relative flex h-20 w-20 items-center justify-center rounded-full text-white disabled:opacity-30 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))",
              boxShadow: isPlaying
                ? "0 0 40px rgba(167,139,250,0.5), 0 8px 30px rgba(0,0,0,0.5)"
                : "0 8px 30px rgba(0,0,0,0.5)",
            }}
            type="button" aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ background: "radial-gradient(circle, rgba(167,139,250,0.5), transparent 70%)" }}
              />
            )}
            <AnimatePresence mode="wait">
              <motion.div
                key={isBuffering && isPlaying ? "buf" : isPlaying ? "pause" : "play"}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="relative z-10"
              >
                {isBuffering && isPlaying ? (
                  <div className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : isPlaying ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1.5" />
                    <rect x="14" y="4" width="4" height="16" rx="1.5" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: 3 }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onNext}
            disabled={!track}
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-secondary-text disabled:opacity-30"
            style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-subtle)" }}
            type="button" aria-label="Next"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </motion.button>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-3 mt-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-secondary-text/40 shrink-0">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          </svg>
          <input
            type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => onVolumeChange(Number(e.target.value))}
            className="flex-1 h-0.5 cursor-pointer appearance-none rounded-full"
            style={{ background: `linear-gradient(to right, var(--color-accent) ${volume * 100}%, var(--color-border-default) ${volume * 100}%)` }}
            aria-label="Volume"
          />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-secondary-text/40 shrink-0">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
