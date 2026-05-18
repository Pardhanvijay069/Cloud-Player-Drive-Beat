"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TrackCard } from "@/components/TrackCard";
import { SearchBar } from "@/components/SearchBar";
import { LibraryTabs, type LibraryTab } from "@/components/LibraryTabs";
import { ArtistCard } from "@/components/ArtistCard";
import { AlbumCard } from "@/components/AlbumCard";
import { QueuePanel } from "@/components/QueuePanel";
import {
  searchTracks,
  groupByArtist,
  groupByAlbum,
  type ArtistGroup,
  type AlbumGroup,
} from "@/lib/music-metadata";
import type { DriveAudioFile } from "@/lib/google-drive";

type Props = {
  tracks: DriveAudioFile[];
  currentTrackId?: string;
  currentIndex: number;
  isLoading: boolean;
  error?: string | null;
  onSelectTrack: (track: DriveAudioFile) => void;
  sourceMode?: "private" | "public";
};

/** Shimmer skeleton for track row */
function SkeletonTrack({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl p-3 sm:p-3.5"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--color-border-subtle)",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0 shimmer" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-3/5 rounded-lg shimmer" />
        <div className="h-2.5 w-2/5 rounded-lg shimmer" />
      </div>
    </div>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={`skel-grid-${i}`}
          className="rounded-2xl p-5"
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid var(--color-border-subtle)",
            animationDelay: `${i * 60}ms`,
          }}
        >
          <div className="mx-auto aspect-square w-full rounded-xl mb-3 shimmer" />
          <div className="h-3 w-2/3 mx-auto rounded shimmer mb-2" />
          <div className="h-2 w-1/3 mx-auto rounded shimmer" />
        </div>
      ))}
    </div>
  );
}

export function Playlist({
  tracks,
  currentTrackId,
  currentIndex,
  isLoading,
  error,
  onSelectTrack,
  sourceMode = "private",
}: Props) {
  const [activeTab, setActiveTab] = useState<LibraryTab>("songs");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArtist, setExpandedArtist] = useState<ArtistGroup | null>(null);
  const [expandedAlbum, setExpandedAlbum] = useState<AlbumGroup | null>(null);

  const filteredTracks = useMemo(
    () => searchTracks(tracks, searchQuery),
    [tracks, searchQuery]
  );

  const artists = useMemo(() => groupByArtist(tracks), [tracks]);
  const albums = useMemo(() => groupByAlbum(tracks), [tracks]);

  const filteredArtists = useMemo(() => {
    if (!searchQuery.trim()) return artists;
    const q = searchQuery.toLowerCase();
    return artists.filter((a) => a.name.toLowerCase().includes(q));
  }, [artists, searchQuery]);

  const filteredAlbums = useMemo(() => {
    if (!searchQuery.trim()) return albums;
    const q = searchQuery.toLowerCase();
    return albums.filter(
      (a) => a.name.toLowerCase().includes(q) || a.artist.toLowerCase().includes(q)
    );
  }, [albums, searchQuery]);

  const tabCounts = useMemo(
    () => ({
      songs: tracks.length,
      artists: artists.length,
      albums: albums.length,
      queue: Math.max(0, tracks.length - currentIndex - 1),
    }),
    [tracks.length, artists.length, albums.length, currentIndex]
  );

  const handleBackFromDetail = useCallback(() => {
    setExpandedArtist(null);
    setExpandedAlbum(null);
  }, []);

  const connected = tracks.length > 0 || isLoading;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.19, 1, 0.22, 1] }}
      className="flex-1 min-w-0"
    >
      {/* Section header */}
      <div className="mb-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-secondary-text font-medium">
              Library
            </p>
            <h2 className="mt-0.5 text-xl sm:text-2xl font-bold text-primary-text tracking-tight">
              {expandedArtist
                ? expandedArtist.name
                : expandedAlbum
                ? expandedAlbum.name
                : "Your Music"}
            </h2>
            {expandedAlbum && (
              <p className="text-xs text-secondary-text mt-0.5">{expandedAlbum.artist}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(expandedArtist || expandedAlbum) && (
              <motion.button
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={handleBackFromDetail}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-secondary-text transition-all hover:text-primary-text"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border-subtle)" }}
                type="button"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                Back
              </motion.button>
            )}
            {tracks.length > 0 && sourceMode === "public" && (
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium"
                style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", color: "rgb(56,189,248)" }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                </svg>
                Public
              </span>
            )}
            {tracks.length > 0 && (
              <span
                className="rounded-full px-3 py-1 text-[11px] font-medium text-secondary-text"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border-subtle)" }}
              >
                {tracks.length} track{tracks.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Search + Tabs */}
        {connected && !expandedArtist && !expandedAlbum && (
          <div className="space-y-3">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={
                searchQuery
                  ? activeTab === "songs"
                    ? filteredTracks.length
                    : activeTab === "artists"
                    ? filteredArtists.length
                    : activeTab === "albums"
                    ? filteredAlbums.length
                    : undefined
                  : undefined
              }
            />
            <LibraryTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={tabCounts}
            />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="space-y-2">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-2">
            {activeTab === "songs" || activeTab === "queue" ? (
              Array.from({ length: 7 }).map((_, i) => (
                <SkeletonTrack key={`skeleton-${i}`} index={i} />
              ))
            ) : (
              <SkeletonGrid count={8} />
            )}
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl p-5 text-sm"
            style={{
              background: "rgba(239,68,68,0.06)",
              border: "1px solid rgba(239,68,68,0.2)",
              color: "rgb(248,113,113)",
            }}
          >
            <div className="flex items-start gap-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
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
            className="rounded-3xl p-10 sm:p-14 text-center"
            style={{
              background: "rgba(255,255,255,0.015)",
              border: "1px dashed var(--color-border-default)",
            }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl mb-6"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.12), rgba(103,232,249,0.08))",
                border: "1px solid rgba(167,139,250,0.2)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-accent">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </motion.div>
            <p className="text-base font-semibold text-primary-text">
              Your library is empty
            </p>
            <p className="mt-2 text-sm text-secondary-text max-w-sm mx-auto leading-6">
              Select a Google Drive folder or paste a public folder link to start streaming your music.
            </p>
          </motion.div>
        )}

        {/* ─── Detail views ─── */}
        <AnimatePresence mode="wait">
          {expandedArtist && !isLoading && (
            <motion.div
              key="artist-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              {expandedArtist.tracks.map((track, index) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={index}
                  isActive={currentTrackId === track.id}
                  onClick={() => onSelectTrack(track)}
                />
              ))}
            </motion.div>
          )}

          {expandedAlbum && !isLoading && (
            <motion.div
              key="album-detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              {expandedAlbum.tracks.map((track, index) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  index={index}
                  isActive={currentTrackId === track.id}
                  onClick={() => onSelectTrack(track)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Tab content ─── */}
        {!expandedArtist && !expandedAlbum && !isLoading && !error && tracks.length > 0 && (
          <AnimatePresence mode="wait">
            {activeTab === "songs" && (
              <motion.div
                key="songs"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-1.5"
              >
                {filteredTracks.length === 0 && searchQuery ? (
                  <NoResults query={searchQuery} />
                ) : (
                  filteredTracks.map((track, index) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      index={index}
                      isActive={currentTrackId === track.id}
                      onClick={() => onSelectTrack(track)}
                    />
                  ))
                )}
              </motion.div>
            )}

            {activeTab === "artists" && (
              <motion.div
                key="artists"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {filteredArtists.length === 0 && searchQuery ? (
                  <NoResults query={searchQuery} />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredArtists.map((artist, i) => (
                      <ArtistCard
                        key={artist.name}
                        artist={artist}
                        index={i}
                        onSelect={setExpandedArtist}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "albums" && (
              <motion.div
                key="albums"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {filteredAlbums.length === 0 && searchQuery ? (
                  <NoResults query={searchQuery} />
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {filteredAlbums.map((album, i) => (
                      <AlbumCard
                        key={album.name + album.artist}
                        album={album}
                        index={i}
                        onSelect={setExpandedAlbum}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "queue" && (
              <motion.div
                key="queue"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <QueuePanel
                  tracks={tracks}
                  currentIndex={currentIndex}
                  onSelectTrack={onSelectTrack}
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.section>
  );
}

function NoResults({ query }: { query: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-10 text-center"
      style={{
        background: "rgba(255,255,255,0.015)",
        border: "1px dashed var(--color-border-default)",
      }}
    >
      <div
        className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-3"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-secondary-text">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-primary-text">No results found</p>
      <p className="mt-1 text-xs text-secondary-text">
        No matches for &ldquo;{query}&rdquo;
      </p>
    </motion.div>
  );
}
