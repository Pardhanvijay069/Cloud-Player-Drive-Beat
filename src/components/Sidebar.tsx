"use client";

import { motion } from "framer-motion";
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
  onClearFolder?: () => void;
  trackCount?: number;
};

export function Sidebar({
  pickerApiKey,
  pickerAppId,
  selectedFolderId,
  selectedFolderName,
  isLoadingTracks,
  onFolderSelected,
  onClearFolder,
  trackCount = 0
}: Props) {
  const connected = Boolean(selectedFolderId);

  return (
    <motion.aside
      initial={{ x: -30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
      className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-[300px] xl:w-[320px] shrink-0"
    >
      {/* Folder Picker Card */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-primary-text">Drive Source</p>
        </div>

        {connected ? (
          <button
            onClick={onClearFolder}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition-all duration-200"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            Change Folder
          </button>
        ) : (
          <DriveFolderPicker
            buttonLabel="Select Drive Folder"
            onFolderChosen={onFolderSelected}
            pickerApiKey={pickerApiKey}
            pickerAppId={pickerAppId}
            showSelectedPreview={false}
          />
        )}
      </div>

      {/* Connection Status Card */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary-text font-medium mb-3">Status</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-secondary-text">Connection</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              connected
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-surface-elevated text-secondary-text border border-border-subtle"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-secondary-text/50"}`} />
              {connected ? "Connected" : "Not selected"}
            </span>
          </div>

          <div>
            <p className="text-xs text-secondary-text mb-1">Folder</p>
            <p className="text-sm font-medium text-primary-text truncate">
              {selectedFolderName || selectedFolderId || "No folder selected"}
            </p>
          </div>

          {connected && (
            <div>
              <p className="text-xs text-secondary-text mb-1">Tracks</p>
              <p className="text-sm font-medium text-primary-text">
                {isLoadingTracks ? (
                  <span className="inline-flex items-center gap-2 text-accent">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                    Loading...
                  </span>
                ) : (
                  `${trackCount} audio file${trackCount !== 1 ? "s" : ""}`
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Info */}
      <div className="glass-card rounded-2xl p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-secondary-text font-medium mb-3">Quick Tips</p>
        <div className="space-y-2">
          {[
            "Select a Drive folder to build your playlist",
            "Click any track to start playback",
            "Use keyboard Space to play/pause"
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-accent/60 shrink-0" />
              <p className="text-xs text-secondary-text leading-5">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
