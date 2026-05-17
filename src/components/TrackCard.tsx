"use client";

import { motion } from "framer-motion";
import type { DriveAudioFile } from "@/lib/google-drive";

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

export function TrackCard({ track, index, isActive, onClick }: Props) {
  const ext = getFileExtension(track.name);
  const displayName = track.name.replace(/\.[^/.]+$/, "");
  const sizeStr = formatSize(track.size);

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`group relative flex w-full items-center gap-3 rounded-2xl border p-3 sm:p-4 text-left transition-all duration-300 ${
        isActive
          ? "border-accent/40 bg-accent/8 shadow-[0_0_30px_rgba(var(--accent-rgb),0.08)]"
          : "border-border-subtle bg-surface/40 hover:border-border-default hover:bg-surface-elevated/50"
      }`}
      onClick={onClick}
      type="button"
    >
      {/* Track number / active indicator */}
      <div className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-xs font-bold transition-all duration-300 shrink-0 ${
        isActive
          ? "bg-gradient-to-br from-accent to-accent-secondary text-white shadow-lg shadow-accent/30"
          : "bg-surface-elevated text-secondary-text group-hover:bg-accent/10 group-hover:text-accent"
      }`}>
        {isActive ? (
          <div className="flex items-center gap-0.5">
            <span className="inline-block h-2.5 w-0.5 animate-pulse rounded-full bg-white" style={{ animationDelay: "0ms" }} />
            <span className="inline-block h-3.5 w-0.5 animate-pulse rounded-full bg-white" style={{ animationDelay: "150ms" }} />
            <span className="inline-block h-2 w-0.5 animate-pulse rounded-full bg-white" style={{ animationDelay: "300ms" }} />
            <span className="inline-block h-3 w-0.5 animate-pulse rounded-full bg-white" style={{ animationDelay: "75ms" }} />
          </div>
        ) : (
          <span>{String(index + 1).padStart(2, "0")}</span>
        )}
      </div>

      {/* Track info */}
      <div className="min-w-0 flex-1">
        <p className={`truncate text-sm font-medium transition-colors ${
          isActive ? "text-accent" : "text-primary-text"
        }`}>
          {displayName}
        </p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-secondary-text">
          <span className="inline-flex items-center rounded-md bg-surface-elevated/80 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider">
            {ext}
          </span>
          {sizeStr && <span>{sizeStr}</span>}
        </p>
      </div>

      {/* Playing dot */}
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="h-2 w-2 rounded-full bg-accent shadow-[0_0_12px_rgba(var(--accent-rgb),0.7)] shrink-0"
        />
      )}

      {/* Hover glow (desktop only) */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r from-accent/[0.03] to-transparent" />
    </motion.button>
  );
}
