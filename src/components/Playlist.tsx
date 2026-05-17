"use client";

import { motion } from "framer-motion";
import { TrackCard } from "@/components/TrackCard";
import type { DriveAudioFile } from "@/lib/google-drive";

type Props = {
  tracks: DriveAudioFile[];
  currentTrackId?: string;
  isLoading: boolean;
  error?: string | null;
  onSelectTrack: (track: DriveAudioFile) => void;
};

function SkeletonTrack({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-border-subtle bg-surface/30 p-4 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="h-11 w-11 rounded-xl bg-surface-elevated/60 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/4 rounded-lg bg-surface-elevated/60" />
        <div className="h-2.5 w-1/3 rounded-lg bg-surface-elevated/40" />
      </div>
    </div>
  );
}

export function Playlist({
  tracks,
  currentTrackId,
  isLoading,
  error,
  onSelectTrack
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      className="flex-1 min-w-0"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-secondary-text font-medium">Playlist</p>
          <h2 className="mt-1.5 text-xl sm:text-2xl font-semibold text-primary-text">Your Tracks</h2>
        </div>
        {tracks.length > 0 && (
          <span className="rounded-full bg-surface-elevated/80 border border-border-subtle px-3 py-1 text-xs font-medium text-secondary-text">
            {tracks.length} track{tracks.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Track list */}
      <div className="space-y-2">
        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonTrack key={`skeleton-${i}`} index={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 text-sm text-red-400 backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span>{error}</span>
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!isLoading && !error && tracks.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-dashed border-border-subtle bg-surface/30 p-8 sm:p-12 text-center"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-elevated/60 mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-secondary-text">
                <path d="M9 18V5l12-2v13"/>
                <circle cx="6" cy="18" r="3"/>
                <circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <p className="text-sm font-medium text-primary-text">No audio files found</p>
            <p className="mt-2 text-xs text-secondary-text max-w-xs mx-auto leading-5">
              Select a Google Drive folder containing audio files to build your playlist
            </p>
          </motion.div>
        )}

        {/* Track cards */}
        {!isLoading && !error && tracks.map((track, index) => (
          <TrackCard
            key={track.id}
            track={track}
            index={index}
            isActive={currentTrackId === track.id}
            onClick={() => onSelectTrack(track)}
          />
        ))}
      </div>
    </motion.section>
  );
}
