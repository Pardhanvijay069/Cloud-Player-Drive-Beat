"use client";

import { motion } from "framer-motion";
import type { DriveAudioFile } from "@/lib/google-drive";
import { parseTrackMetadata } from "@/lib/music-metadata";

type Props = {
  tracks: DriveAudioFile[];
  currentIndex: number;
  onSelectTrack: (track: DriveAudioFile) => void;
};

export function QueuePanel({ tracks, currentIndex, onSelectTrack }: Props) {
  const upNext = tracks.slice(currentIndex + 1);
  const nowPlaying = currentIndex >= 0 ? tracks[currentIndex] : null;
  const played = tracks.slice(0, currentIndex);

  return (
    <div className="space-y-6">
      {/* Now Playing */}
      {nowPlaying && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-secondary-text font-medium mb-2.5">
            Now Playing
          </p>
          <QueueItem track={nowPlaying} isActive />
        </div>
      )}

      {/* Up Next */}
      {upNext.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-secondary-text font-medium mb-2.5">
            Up Next · {upNext.length} track{upNext.length !== 1 ? "s" : ""}
          </p>
          <div className="space-y-1">
            {upNext.slice(0, 20).map((track, i) => (
              <QueueItem
                key={track.id}
                track={track}
                index={i}
                onClick={() => onSelectTrack(track)}
              />
            ))}
            {upNext.length > 20 && (
              <p className="py-2 text-center text-xs text-secondary-text">
                +{upNext.length - 20} more tracks
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recently Played */}
      {played.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-secondary-text font-medium mb-2.5">
            Recently Played
          </p>
          <div className="space-y-1 opacity-50">
            {played
              .slice(-5)
              .reverse()
              .map((track) => (
                <QueueItem
                  key={`played-${track.id}`}
                  track={track}
                  onClick={() => onSelectTrack(track)}
                />
              ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!nowPlaying && upNext.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-10 text-center"
          style={{
            background: "rgba(255,255,255,0.015)",
            border: "1px dashed var(--color-border-default)",
          }}
        >
          <div
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl mb-3"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-secondary-text">
              <line x1="8" y1="6" x2="21" y2="6" />
              <line x1="8" y1="12" x2="21" y2="12" />
              <line x1="8" y1="18" x2="21" y2="18" />
              <line x1="3" y1="6" x2="3.01" y2="6" />
              <line x1="3" y1="12" x2="3.01" y2="12" />
              <line x1="3" y1="18" x2="3.01" y2="18" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-primary-text">Queue is empty</p>
          <p className="mt-1 text-xs text-secondary-text">Select a track to start playing</p>
        </motion.div>
      )}
    </div>
  );
}

/** Individual queue item */
function QueueItem({
  track,
  index,
  isActive,
  onClick,
}: {
  track: DriveAudioFile;
  index?: number;
  isActive?: boolean;
  onClick?: () => void;
}) {
  const meta = parseTrackMetadata(track.name);

  return (
    <motion.button
      initial={index !== undefined ? { opacity: 0, x: 10 } : false}
      animate={{ opacity: 1, x: 0 }}
      transition={index !== undefined ? { duration: 0.2, delay: index * 0.025 } : undefined}
      className="group flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition-all duration-200"
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(103,232,249,0.05))"
          : "transparent",
        border: isActive
          ? "1px solid rgba(167,139,250,0.2)"
          : "1px solid transparent",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
          (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-subtle)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.borderColor = "transparent";
        }
      }}
      onClick={onClick}
      type="button"
      disabled={isActive}
    >
      {/* Mini indicator */}
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold transition-all"
        style={isActive
          ? { background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))", boxShadow: "0 2px 8px rgba(167,139,250,0.3)" }
          : { background: "rgba(255,255,255,0.05)", color: "var(--color-secondary-text)" }
        }
      >
        {isActive ? (
          <div className="flex items-center gap-px">
            <span className="inline-block h-2 w-[2px] animate-pulse rounded-full bg-white" style={{ animationDelay: "0ms" }} />
            <span className="inline-block h-3 w-[2px] animate-pulse rounded-full bg-white" style={{ animationDelay: "150ms" }} />
            <span className="inline-block h-1.5 w-[2px] animate-pulse rounded-full bg-white" style={{ animationDelay: "300ms" }} />
          </div>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M9 18V5l12-2v13" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className={`truncate text-xs font-semibold leading-tight ${isActive ? "text-accent" : "text-primary-text"}`}>
          {meta.title}
        </p>
        <p className="truncate text-[10px] text-secondary-text mt-0.5">
          {meta.artist}
        </p>
      </div>
    </motion.button>
  );
}
