"use client";

import { useEffect, useState } from "react";

import type { DriveAudioFile } from "@/lib/google-drive";

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
};

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) {
    return "0:00";
  }

  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PlayerBar({
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
  onNext
}: Props) {
  const [seekValue, setSeekValue] = useState(progress);

  useEffect(() => {
    setSeekValue(progress);
  }, [progress]);

  return (
    <div className="sticky bottom-0 z-20 border-t border-white/10 bg-ink/90 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1.1fr_1.2fr_0.7fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.28em] text-white/40">Now Playing</p>
          <p className="mt-2 truncate text-lg font-semibold text-white">
            {track?.name ?? "Select a track to start playback"}
          </p>
          <p className="mt-1 text-sm text-white/55">{track?.mimeType ?? "Google Drive stream"}</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <button
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              onClick={onPrevious}
              type="button"
            >
              Prev
            </button>
            <button
              className="rounded-full bg-mint px-6 py-3 text-sm font-semibold text-ink transition hover:bg-[#73e4b6]"
              onClick={onTogglePlay}
              type="button"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/10"
              onClick={onNext}
              type="button"
            >
              Next
            </button>
          </div>
          <div className="space-y-2">
            <input
              aria-label="Seek"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-mint"
              max={100}
              min={0}
              onChange={(event) => setSeekValue(Number(event.target.value))}
              onMouseUp={() => onSeek(seekValue)}
              onTouchEnd={() => onSeek(seekValue)}
              step={0.1}
              type="range"
              value={seekValue}
            />
            <div className="flex justify-between text-xs text-white/45">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-white/60">
            <span>Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            aria-label="Volume"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-sky"
            max={1}
            min={0}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            step={0.01}
            type="range"
            value={volume}
          />
        </div>
      </div>
    </div>
  );
}
