"use client";

import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DriveAudioFile } from "@/lib/google-drive";
import { parseTrackMetadata } from "@/lib/music-metadata";
import { useTheme } from "@/components/providers/theme-provider";

type Props = {
  track?: DriveAudioFile;
  isPlaying: boolean;
  progress: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onOpen: () => void;
};

/** Animated wave bars */
function WaveBars({ isPlaying }: { isPlaying: boolean }) {
  if (!isPlaying) {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-white" style={{ marginLeft: 2 }}>
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }
  return (
    <div className="flex items-end gap-0.5 h-4">
      {[0, 150, 300, 75].map((delay, i) => (
        <motion.span
          key={i}
          className="inline-block w-[3px] rounded-full bg-white"
          animate={{ scaleY: [0.3, 1, 0.3] }}
          transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: delay / 1000 }}
          style={{ height: "100%", transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

function MobilePlayerBarInner({ track, isPlaying, progress, onTogglePlay, onNext, onOpen }: Props) {
  const { theme } = useTheme();
  const meta = track ? parseTrackMetadata(track.name) : null;

  if (!track) return null;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 300 }}
      className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 lg:hidden"
    >
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{
          background: "var(--color-surface-glass)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          border: "1px solid var(--color-border-accent)",
          boxShadow: "var(--shadow-player)",
        }}
      >
        {/* Progress strip */}
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "var(--color-border-subtle)" }}>
          <motion.div
            className="h-full"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--color-accent), var(--color-accent-secondary))",
              boxShadow: "0 0 6px rgba(var(--accent-rgb),0.45)",
              transition: "width 0.1s linear",
            }}
          />
        </div>

        {/* Main row — tap anywhere except buttons to open fullscreen */}
        <div className="flex items-center gap-3 px-4 py-3">
          {/* Tap area */}
          <button
            onClick={onOpen}
            className="flex-1 flex items-center gap-3 min-w-0 text-left"
            type="button"
            aria-label="Open full player"
          >
            {/* Mini vinyl */}
            <div
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl overflow-hidden"
              style={{
                background: theme === "dark"
                  ? "radial-gradient(circle at 35% 30%, #2a1a4e, #100c1e)"
                  : "radial-gradient(circle at 35% 30%, #dbeafe, #c7d2fe)",
                border: "1px solid var(--color-border-accent)",
                animation: isPlaying ? "vinyl-spin 3s linear infinite" : undefined,
              }}
            >
              <div className="absolute inset-0" style={{
                background: `repeating-radial-gradient(circle at center,
                  transparent 0px, transparent 4px,
                  rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 5px
                )`
              }} />
              <div className="rounded-full" style={{
                width: "35%", height: "35%",
                background: "radial-gradient(circle, rgba(167,139,250,0.5), rgba(103,232,249,0.3))",
              }}>
                <div
                  className="rounded-full m-auto"
                  style={{
                    width: "30%",
                    height: "30%",
                    marginTop: "35%",
                    background: theme === "dark" ? "#0a0612" : "#e2e8f0",
                  }}
                />
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="truncate text-sm font-semibold text-primary-text leading-tight">
                    {meta?.title ?? track.name}
                  </p>
                  {meta?.artist && meta.artist !== "Unknown Artist" && (
                    <p className="truncate text-xs text-secondary-text mt-0.5">{meta.artist}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </button>

          {/* Play/Pause */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onTogglePlay}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))",
              boxShadow: isPlaying ? "0 0 16px rgba(167,139,250,0.5)" : "none",
            }}
            type="button"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            <WaveBars isPlaying={isPlaying} />
          </motion.button>

          {/* Next */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onNext}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-secondary-text"
            style={{ background: "var(--color-surface-elevated)", border: "1px solid var(--color-border-subtle)" }}
            type="button"
            aria-label="Next"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export const MobilePlayerBar = memo(MobilePlayerBarInner);
