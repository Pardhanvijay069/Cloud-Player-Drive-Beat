"use client";

import type { DriveAudioFile } from "@/lib/google-drive";

type Props = {
  tracks: DriveAudioFile[];
  currentTrackId?: string;
  isLoading: boolean;
  error?: string | null;
  onSelectTrack: (track: DriveAudioFile) => void;
};

function formatSize(size?: string) {
  if (!size) {
    return "Unknown size";
  }

  const bytes = Number(size);
  if (Number.isNaN(bytes)) {
    return "Unknown size";
  }

  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function PlaylistPanel({
  tracks,
  currentTrackId,
  isLoading,
  error,
  onSelectTrack
}: Props) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-white/40">Playlist</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Folder tracks</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/70">
          {tracks.length} tracks
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-dashed border-white/15 p-6 text-sm text-white/60">
          Loading audio files from Google Drive...
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="rounded-3xl border border-coral/30 bg-coral/10 p-6 text-sm text-coral">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && tracks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/15 p-6 text-sm text-white/60">
          No supported audio files found
        </div>
      ) : null}

      <div className="space-y-3">
        {tracks.map((track, index) => {
          const active = currentTrackId === track.id;

          return (
            <button
              key={track.id}
              className={`flex w-full items-center gap-4 rounded-3xl border px-4 py-4 text-left transition ${
                active
                  ? "border-mint/40 bg-mint/10"
                  : "border-white/8 bg-white/5 hover:border-white/20 hover:bg-white/8"
              }`}
              onClick={() => onSelectTrack(track)}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-white">{track.name}</p>
                <p className="mt-1 text-sm text-white/55">
                  {track.mimeType} • {formatSize(track.size)}
                </p>
              </div>
              <div
                className={`h-3 w-3 rounded-full ${
                  active ? "bg-mint shadow-[0_0_20px_rgba(139,240,200,0.7)]" : "bg-white/20"
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}
