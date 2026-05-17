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

export function PlayerControls({
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
    <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-800 bg-slate-950/95 px-4 py-4 backdrop-blur-md">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_1.2fr_0.8fr] lg:items-center">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Now playing</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-100">
            {track?.name ?? "Select a track to start playback"}
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-center gap-2">
            <button
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              onClick={onPrevious}
              type="button"
            >
              Prev
            </button>
            <button
              className="rounded-full bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
              onClick={onTogglePlay}
              type="button"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
              onClick={onNext}
              type="button"
            >
              Next
            </button>
          </div>
          <div className="space-y-1">
            <input
              aria-label="Seek"
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-500"
              max={100}
              min={0}
              onChange={(event) => setSeekValue(Number(event.target.value))}
              onMouseUp={() => onSeek(seekValue)}
              onTouchEnd={() => onSeek(seekValue)}
              step={0.1}
              type="range"
              value={seekValue}
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Volume</span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            aria-label="Volume"
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-800 accent-cyan-500"
            max={1}
            min={0}
            onChange={(event) => onVolumeChange(Number(event.target.value))}
            step={0.01}
            type="range"
            value={volume}
          />
        </div>
      </div>
    </footer>
  );
}
