"use client";

import type { DriveAudioFile } from "@/lib/google-drive";

type Props = {
  tracks: DriveAudioFile[];
  currentTrackId?: string;
  isLoading: boolean;
  error?: string | null;
  onSelectTrack: (track: DriveAudioFile) => void;
};

export function TrackList({
  tracks,
  currentTrackId,
  isLoading,
  error,
  onSelectTrack
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(2,8,23,0.45)] backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Tracks</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-100">Folder Audio Files</h2>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
          {tracks.length}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {isLoading ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
            Loading audio files...
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-5 text-sm text-rose-300">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-5 text-sm text-slate-400">
            No supported audio files found.
          </div>
        ) : null}

        {tracks.map((track) => {
          const active = currentTrackId === track.id;

          return (
            <button
              key={track.id}
              className={`group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all duration-200 ${
                active
                  ? "border-cyan-500/50 bg-cyan-500/12"
                  : "border-slate-800 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-800/45"
              }`}
              onClick={() => onSelectTrack(track)}
              type="button"
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-semibold ${
                  active
                    ? "bg-cyan-500/25 text-cyan-200"
                    : "bg-slate-800 text-slate-300 group-hover:bg-slate-700"
                }`}
              >
                AU
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-100">
                {track.name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
