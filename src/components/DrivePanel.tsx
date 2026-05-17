"use client";

import { DriveFolderPicker } from "@/components/DriveFolderPicker";

type FolderSelection = {
  id: string;
  name?: string;
};

type Props = {
  pickerApiKey?: string;
  pickerAppId?: string;
  selectedFolderId?: string | null;
  selectedFolderName?: string | null;
  isLoadingTracks?: boolean;
  onFolderSelected: (selection: FolderSelection) => void;
};

export function DrivePanel({
  pickerApiKey,
  pickerAppId,
  selectedFolderId,
  selectedFolderName,
  isLoadingTracks,
  onFolderSelected
}: Props) {
  const connected = Boolean(selectedFolderId);

  return (
    <aside className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-[0_20px_60px_rgba(2,8,23,0.45)] backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Drive Control</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-100">Folder Source</h2>
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Connect a Google Drive folder to build your cloud playlist.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <DriveFolderPicker
          buttonLabel="Select Drive Folder"
          onFolderChosen={onFolderSelected}
          pickerApiKey={pickerApiKey}
          pickerAppId={pickerAppId}
          showSelectedPreview={false}
        />
      </div>

      <div className="mt-5 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Status</span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              connected
                ? "bg-cyan-500/15 text-cyan-300"
                : "bg-slate-700/60 text-slate-300"
            }`}
          >
            {connected ? "Connected" : "Not selected"}
          </span>
        </div>
        <div>
          <p className="text-sm text-slate-400">Folder</p>
          <p className="mt-1 truncate text-sm font-medium text-slate-100">
            {selectedFolderName || selectedFolderId || "No folder selected"}
          </p>
        </div>
        {isLoadingTracks ? (
          <p className="text-xs text-cyan-300">Loading files from Drive...</p>
        ) : null}
      </div>
    </aside>
  );
}
