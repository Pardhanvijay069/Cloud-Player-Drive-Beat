"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";

import { Sidebar } from "@/components/Sidebar";
import { MobileDrawer } from "@/components/MobileDrawer";
import { Playlist } from "@/components/Playlist";
import { PlayerBar } from "@/components/PlayerBar";
import { useBufferState } from "@/hooks/use-buffer-state";
import { useAudioPreloader } from "@/hooks/use-audio-preloader";
import { useTrackCache } from "@/hooks/use-track-cache";
import type { DriveAudioFile } from "@/lib/google-drive";

type FolderSelection = {
  id: string;
  name?: string;
};

type Props = {
  pickerApiKey?: string;
  pickerAppId?: string;
};

export function MusicPlayerShell({ pickerApiKey, pickerAppId }: Props) {
  const { data: session } = useSession();
  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const currentTrack = useMemo(
    () => (currentIndex >= 0 ? tracks[currentIndex] : undefined),
    [currentIndex, tracks]
  );

  // ─── Streaming hooks ───────────────────────────────────────────────
  // Track buffer state (played vs buffered ranges)
  const bufferState = useBufferState(audioRef.current);

  // Intelligent next-track preloading
  useAudioPreloader({
    currentIndex,
    tracks,
    progress,
    isPlaying,
  });

  // Auto-cache currently playing track after 5s of playback
  const { isCached, isCaching } = useTrackCache(currentTrack, isPlaying);
  // ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const savedFolder = localStorage.getItem('selectedFolder');
    if (savedFolder) {
      try {
        const folder = JSON.parse(savedFolder) as FolderSelection;
        setSelectedFolder(folder);
      } catch {
        localStorage.removeItem('selectedFolder');
      }
    }
  }, []);

  useEffect(() => {
    const folderId = selectedFolder?.id;

    if (!folderId) {
      return;
    }

    let active = true;

    async function loadTracks() {
      setIsLoading(true);
      setError(null);
      setTracks([]);
      setCurrentIndex(-1);
      setIsPlaying(false);

      try {
        const response = await fetch(`/api/drive/folder/${folderId}/files`, {
          cache: "no-store"
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to load folder tracks");
        }

        if (!active) {
          return;
        }

        setTracks(payload);
        if (payload.length > 0) {
          setCurrentIndex(0);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unexpected error while loading tracks"
          );
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTracks();

    return () => {
      active = false;
    };
  }, [selectedFolder?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setCurrentTime(audio.currentTime);
      setDuration(nextDuration);
      setProgress(nextDuration ? (audio.currentTime / nextDuration) * 100 : 0);
    };

    const handleLoadedMetadata = () => {
      const nextDuration = Number.isFinite(audio.duration) ? audio.duration : 0;
      setDuration(nextDuration);
    };

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      return;
    }

    audio.src = `/api/stream/${currentTrack.id}`;
    audio.load();

    const playTrack = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    void playTrack();
  }, [currentTrack]);

  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      void signOut({ callbackUrl: "/" });
    }
  }, [session?.error]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        handleTogglePlay();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, currentTrack]);

  const handleTogglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) {
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setError("Browser autoplay was blocked. Tap play again to continue.");
    }
  };

  const handleSelectTrack = (track: DriveAudioFile) => {
    const nextIndex = tracks.findIndex((item) => item.id === track.id);
    if (nextIndex >= 0) {
      setCurrentIndex(nextIndex);
    }
  };

  const handleClearFolder = () => {
    localStorage.removeItem('selectedFolder');
    setSelectedFolder(null);
    setTracks([]);
    setCurrentIndex(-1);
    setIsPlaying(false);
  };

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !duration) {
      return;
    }

    const nextTime = (value / 100) * duration;
    audio.currentTime = nextTime;
    setProgress(value);
    setCurrentTime(nextTime);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= 0 && prev < tracks.length - 1 ? prev + 1 : prev));
  };

  return (
    <>
      {/* preload="auto" tells the browser to eagerly buffer audio data */}
      <audio ref={audioRef} preload="auto" />

      {/* Mobile drawer toggle */}
      <div className="lg:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-secondary text-white shadow-lg shadow-accent/25"
          type="button"
          aria-label="Open menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isLoadingTracks={isLoading}
        onFolderSelected={setSelectedFolder}
        onClearFolder={handleClearFolder}
        pickerApiKey={pickerApiKey}
        pickerAppId={pickerAppId}
        selectedFolderId={selectedFolder?.id ?? null}
        selectedFolderName={selectedFolder?.name ?? null}
        trackCount={tracks.length}
      />

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Desktop sidebar */}
          <Sidebar
            isLoadingTracks={isLoading}
            onFolderSelected={setSelectedFolder}
            onClearFolder={handleClearFolder}
            pickerApiKey={pickerApiKey}
            pickerAppId={pickerAppId}
            selectedFolderId={selectedFolder?.id ?? null}
            selectedFolderName={selectedFolder?.name ?? null}
            trackCount={tracks.length}
          />

          {/* Playlist area */}
          <Playlist
            currentTrackId={currentTrack?.id}
            error={error}
            isLoading={isLoading}
            onSelectTrack={handleSelectTrack}
            tracks={tracks}
          />
        </div>
      </main>

      {/* Floating player bar */}
      <PlayerBar
        currentTime={currentTime}
        duration={duration}
        isPlaying={isPlaying}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSeek={handleSeek}
        onTogglePlay={handleTogglePlay}
        onVolumeChange={setVolume}
        progress={progress}
        track={currentTrack}
        volume={volume}
        bufferState={bufferState}
        isCached={isCached}
        isCaching={isCaching}
      />
    </>
  );
}
