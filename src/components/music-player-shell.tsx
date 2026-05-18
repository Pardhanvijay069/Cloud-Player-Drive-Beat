"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { AnimatePresence } from "framer-motion";

import { Sidebar } from "@/components/Sidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { Playlist } from "@/components/Playlist";
import { NowPlayingPanel } from "@/components/NowPlayingPanel";
import { MobilePlayerBar } from "@/components/MobilePlayerBar";
import { MobilePlayerView } from "@/components/MobilePlayerView";
import { useBufferState } from "@/hooks/use-buffer-state";
import { useAudioPreloader } from "@/hooks/use-audio-preloader";
import { useTrackCache } from "@/hooks/use-track-cache";
import { useTheme } from "@/components/providers/theme-provider";
import type { DriveAudioFile } from "@/lib/google-drive";

type FolderSelection = {
  id: string;
  name?: string;
};

type SourceMode = "private" | "public";

type Props = {
  pickerApiKey?: string;
  pickerAppId?: string;
};

export function MusicPlayerShell({ pickerApiKey, pickerAppId }: Props) {
  const { data: session } = useSession();
  const { theme } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Core state ──────────────────────────────────────────────────────
  const [selectedFolder, setSelectedFolder] = useState<FolderSelection | null>(null);
  const [tracks, setTracks] = useState<DriveAudioFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobilePlayerOpen, setMobilePlayerOpen] = useState(false);

  // ─── Public folder ────────────────────────────────────────────────────
  const [sourceMode, setSourceMode] = useState<SourceMode>("private");
  const [publicFolderName, setPublicFolderName] = useState<string | null>(null);

  const currentTrack = useMemo(
    () => (currentIndex >= 0 ? tracks[currentIndex] : undefined),
    [currentIndex, tracks]
  );

  // ─── Streaming hooks ──────────────────────────────────────────────────
  const bufferState = useBufferState(audioRef.current);
  useAudioPreloader({ currentIndex, tracks, progress, isPlaying });
  const { isCached, isCaching } = useTrackCache(currentTrack, isPlaying);

  // ─── Volume ───────────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  // ─── Restore saved folder ─────────────────────────────────────────────
  useEffect(() => {
    const savedFolder = localStorage.getItem("selectedFolder");
    if (savedFolder) {
      try {
        const folder = JSON.parse(savedFolder) as FolderSelection & { sourceMode?: SourceMode };
        setSelectedFolder(folder);
        if (folder.sourceMode === "public") {
          setSourceMode("public");
          setPublicFolderName(folder.name ?? null);
        }
      } catch {
        localStorage.removeItem("selectedFolder");
      }
    }
  }, []);

  // ─── Load private folder tracks ───────────────────────────────────────
  useEffect(() => {
    const folderId = selectedFolder?.id;
    if (!folderId || sourceMode === "public") return;

    let active = true;

    async function loadTracks() {
      setIsLoading(true);
      setError(null);
      setTracks([]);
      setCurrentIndex(-1);
      setIsPlaying(false);

      try {
        const response = await fetch(`/api/drive/folder/${folderId}/files`, { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok) throw new Error(payload.error || "Unable to load folder tracks");
        if (!active) return;

        setTracks(payload);
        if (payload.length > 0) setCurrentIndex(0);
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unexpected error while loading tracks");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void loadTracks();
    return () => { active = false; };
  }, [selectedFolder?.id, sourceMode]);

  // ─── Audio event listeners ────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setCurrentTime(audio.currentTime);
      setDuration(d);
      setProgress(d ? (audio.currentTime / d) * 100 : 0);
    };
    const handleLoadedMetadata = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentIndex((prev) => (prev >= 0 && prev < tracks.length - 1 ? prev + 1 : prev));
    };
    const handleError = () => {
      setError("Playback failed. Please choose another file or reconnect your Google session.");
      setIsPlaying(false);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [tracks.length]);

  // ─── Streaming URL ────────────────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    const streamPath = sourceMode === "public"
      ? `/api/stream/public/${currentTrack.id}`
      : `/api/stream/${currentTrack.id}`;

    audio.src = streamPath;
    audio.load();

    const play = async () => {
      try { await audio.play(); setIsPlaying(true); }
      catch { setIsPlaying(false); }
    };
    void play();
  }, [currentTrack, sourceMode]);

  // ─── Auth refresh error ───────────────────────────────────────────────
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") void signOut({ callbackUrl: "/" });
  }, [session?.error]);

  // ─── Keyboard shortcuts ───────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") { e.preventDefault(); void handleTogglePlay(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTrack]);

  // ─── Handlers ────────────────────────────────────────────────────────
  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (isPlaying) { audio.pause(); setIsPlaying(false); return; }
    try { await audio.play(); setIsPlaying(true); }
    catch { setError("Browser autoplay was blocked. Tap play again to continue."); }
  };

  const handleSelectTrack = (track: DriveAudioFile) => {
    const idx = tracks.findIndex((t) => t.id === track.id);
    if (idx >= 0) setCurrentIndex(idx);
  };

  const handleClearFolder = () => {
    localStorage.removeItem("selectedFolder");
    setSelectedFolder(null);
    setTracks([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
    setSourceMode("private");
    setPublicFolderName(null);
    setError(null);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    const t = (value / 100) * duration;
    audio.currentTime = t;
    setProgress(value);
    setCurrentTime(t);
  };

  const handlePrevious = () => setCurrentIndex((p) => (p > 0 ? p - 1 : p));
  const handleNext = () => setCurrentIndex((p) => (p >= 0 && p < tracks.length - 1 ? p + 1 : p));

  const handlePublicFolderLoaded = (data: {
    folderId: string;
    folderName: string;
    files: Array<{ id: string; name: string; mimeType: string; size?: string; modifiedTime?: string }>;
  }) => {
    setSourceMode("public");
    setPublicFolderName(data.folderName);
    setError(null);

    const folderData = { id: data.folderId, name: data.folderName, sourceMode: "public" as const };
    setSelectedFolder(folderData);
    localStorage.setItem("selectedFolder", JSON.stringify(folderData));
    setTracks(data.files);
    if (data.files.length > 0) setCurrentIndex(0);
  };

  // ─── Shared player props ─────────────────────────────────────────────
  const playerProps = {
    track: currentTrack,
    isPlaying,
    progress,
    currentTime,
    duration,
    volume,
    onTogglePlay: handleTogglePlay,
    onSeek: handleSeek,
    onVolumeChange: setVolume,
    onPrevious: handlePrevious,
    onNext: handleNext,
    bufferState,
    isCached,
    isCaching,
    trackIndex: currentIndex,
    trackTotal: tracks.length,
  };

  return (
    <>
      <audio ref={audioRef} preload="auto" />

      {/* ─── Mobile hamburger ─── */}
      <div className="lg:hidden fixed top-3 right-3 z-50">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-secondary-text shadow-xl active:scale-95 transition-all duration-200 hover:text-primary-text"
          style={{
            background: "var(--color-surface-glass)",
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
            border: "1px solid var(--color-border-default)",
            boxShadow: "var(--shadow-card)",
          }}
          type="button"
          aria-label="Open menu"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="6" y1="12" x2="21" y2="12" />
            <line x1="9" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* ─── Mobile drawer ─── */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isLoadingTracks={isLoading}
        onFolderSelected={setSelectedFolder}
        onClearFolder={handleClearFolder}
        pickerApiKey={pickerApiKey}
        pickerAppId={pickerAppId}
        selectedFolderId={selectedFolder?.id ?? null}
        selectedFolderName={selectedFolder?.name ?? publicFolderName ?? null}
        trackCount={tracks.length}
        sourceMode={sourceMode}
        onPublicFolderLoaded={handlePublicFolderLoaded}
      />

      {/* ─── Mobile fullscreen player ─── */}
      <AnimatePresence>
        {mobilePlayerOpen && (
          <MobilePlayerView
            {...playerProps}
            onClose={() => setMobilePlayerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ─── Mobile mini bar ─── */}
      <AnimatePresence>
        {!mobilePlayerOpen && (
          <MobilePlayerBar
            track={currentTrack}
            isPlaying={isPlaying}
            progress={progress}
            onTogglePlay={handleTogglePlay}
            onNext={handleNext}
            onOpen={() => setMobilePlayerOpen(true)}
          />
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════════════════════════════════
          DESKTOP LAYOUT — 3 columns, fullscreen, no max-width constraint
          ═══════════════════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex h-full overflow-hidden">

        {/* ── COL 1: Sidebar (source picker) — fixed width ── */}
        <div
          className="flex flex-col gap-3 overflow-y-auto shrink-0 p-4"
          style={{
            width: 260,
            borderRight: "1px solid var(--color-border-subtle)",
          }}
        >
          <Sidebar
            isLoadingTracks={isLoading}
            onFolderSelected={setSelectedFolder}
            onClearFolder={handleClearFolder}
            pickerApiKey={pickerApiKey}
            pickerAppId={pickerAppId}
            selectedFolderId={selectedFolder?.id ?? null}
            selectedFolderName={selectedFolder?.name ?? publicFolderName ?? null}
            trackCount={tracks.length}
            sourceMode={sourceMode}
            onPublicFolderLoaded={handlePublicFolderLoaded}
          />
        </div>

        {/* ── COL 2: Playlist / Library — flex-1, scrollable ── */}
        <div
          className="flex-1 overflow-y-auto px-5 py-5 min-w-0"
          style={{ borderRight: "1px solid var(--color-border-subtle)" }}
        >
          <Playlist
            currentTrackId={currentTrack?.id}
            currentIndex={currentIndex}
            error={error}
            isLoading={isLoading}
            onSelectTrack={handleSelectTrack}
            tracks={tracks}
            sourceMode={sourceMode}
          />
        </div>

        {/* ── COL 3: Now Playing Panel — fixed width, immersive ── */}
        <div
          className="shrink-0 p-4 overflow-hidden"
          style={{
            width: 340,
            background: theme === "dark"
              ? "linear-gradient(180deg, rgba(8,10,16,0.65), rgba(10,14,20,0.55))"
              : "linear-gradient(180deg, rgba(255,255,255,0.75), rgba(240,243,255,0.85))",
          }}
        >
          <NowPlayingPanel {...playerProps} />
        </div>
      </div>

      {/* ─── MOBILE LAYOUT — full page scroll ─── */}
      <div className="lg:hidden px-3 pt-4 pb-32">
        <Playlist
          currentTrackId={currentTrack?.id}
          currentIndex={currentIndex}
          error={error}
          isLoading={isLoading}
          onSelectTrack={handleSelectTrack}
          tracks={tracks}
          sourceMode={sourceMode}
        />
      </div>
    </>
  );
}
