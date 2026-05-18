"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { DriveAudioFile } from "@/lib/google-drive";
import { parseTrackMetadata } from "@/lib/music-metadata";

type Props = {
  track: DriveAudioFile;
  index: number;
  isActive: boolean;
  onClick: () => void;
};

function formatSize(size?: string) {
  if (!size) return "";
  const bytes = Number(size);
  if (Number.isNaN(bytes)) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function getFileExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "AUD";
}

/** Animated wave bars for currently-playing track */
function WaveBars() {
  return (
    <div className="flex items-center gap-0.5 h-4">
      {[0, 150, 300, 75].map((delay, i) => (
        <motion.span
          key={i}
          className="inline-block w-[3px] rounded-full bg-white"
          animate={{ scaleY: [0.4, 1, 0.4] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: delay / 1000,
          }}
          style={{ height: "100%", transformOrigin: "bottom" }}
        />
      ))}
    </div>
  );
}

function TrackCardInner({ track, index, isActive, onClick }: Props) {
  const ext = getFileExtension(track.name);
  const sizeStr = formatSize(track.size);
  const meta = parseTrackMetadata(track.name);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.025, 0.4) }}
      whileHover={{ scale: 1.006 }}
      whileTap={{ scale: 0.996 }}
      className={`group relative flex w-full items-center gap-3 rounded-2xl p-3 sm:p-3.5 text-left transition-all duration-300 overflow-hidden ${
        isActive
          ? "shadow-lg"
          : "hover:border-border-default"
      }`}
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(103,232,249,0.06))"
          : "rgba(255,255,255,0.02)",
        border: isActive
          ? "1px solid rgba(167,139,250,0.3)"
          : "1px solid var(--color-border-subtle)",
        boxShadow: isActive
          ? "0 4px 24px rgba(167,139,250,0.12), inset 0 1px 0 rgba(255,255,255,0.05)"
          : undefined,
      }}
      onClick={onClick}
      type="button"
    >
      {/* Active left accent */}
      {isActive && (
        <motion.div
          layoutId="track-accent"
          className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
          style={{ background: "linear-gradient(180deg, var(--color-accent), var(--color-accent-secondary))" }}
        />
      )}

      {/* Track number / wave indicator */}
      <div
        className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 shrink-0 ${
          isActive ? "" : "group-hover:bg-accent/8 group-hover:text-accent"
        }`}
        style={isActive
          ? {
            background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))",
            boxShadow: "0 4px 16px rgba(167,139,250,0.4)",
          }
          : { background: "rgba(255,255,255,0.05)" }
        }
      >
        {isActive ? (
          <WaveBars />
        ) : (
          <span className="text-secondary-text tabular-nums text-[11px]">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>

      {/* Track info */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-[13px] sm:text-sm font-semibold leading-tight transition-colors ${
          isActive ? "text-accent" : "text-primary-text"
        }`}>
          {meta.title}
        </p>
        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-secondary-text">
          <span className="truncate">{meta.artist}</span>
          {ext && (
            <>
              <span className="text-border-default">·</span>
              <span
                className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {ext}
              </span>
            </>
          )}
          {sizeStr && <span className="shrink-0 text-secondary-text/60">{sizeStr}</span>}
        </div>
      </div>

      {/* Active dot */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{
            background: "var(--color-accent)",
            boxShadow: "0 0 8px rgba(167,139,250,0.7)",
          }}
        />
      )}

      {/* Hover shimmer */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.03), transparent)" }}
      />
    </motion.button>
  );
}

export const TrackCard = memo(TrackCardInner);
