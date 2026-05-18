"use client";

import { motion } from "framer-motion";
import { DriveFolderPicker } from "@/components/DriveFolderPicker";
import { PublicFolderInput } from "@/components/PublicFolderInput";

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
  sourceMode?: "private" | "public";
  onPublicFolderLoaded?: (data: {
    folderId: string;
    folderName: string;
    files: Array<{
      id: string;
      name: string;
      mimeType: string;
      size?: string;
      modifiedTime?: string;
    }>;
  }) => void;
};

export function Sidebar({
  pickerApiKey,
  pickerAppId,
  selectedFolderId,
  selectedFolderName,
  isLoadingTracks,
  onFolderSelected,
  onClearFolder,
  trackCount = 0,
  sourceMode = "private",
  onPublicFolderLoaded,
}: Props) {
  const connected = Boolean(selectedFolderId);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
      className="flex flex-col gap-3 w-full"
    >
      {/* Drive Source */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
            style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-secondary-text font-medium">Drive Source</p>
            {connected && (
              <p className="text-xs text-primary-text font-medium truncate max-w-[180px]">
                {selectedFolderName ?? selectedFolderId}
              </p>
            )}
          </div>
        </div>

        {connected ? (
          <button
            onClick={onClearFolder}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, rgba(251,146,60,0.15), rgba(251,146,60,0.08))",
              border: "1px solid rgba(251,146,60,0.25)",
              color: "rgb(251,146,60)",
            }}
            type="button"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
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

      {/* Public Folder */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0"
            style={{ background: "rgba(103,232,249,0.10)", border: "1px solid rgba(103,232,249,0.18)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-secondary">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-secondary-text font-medium">Public Folder</p>
            <p className="text-[10px] text-secondary-text/70">No login required</p>
          </div>
        </div>

        <PublicFolderInput
          onFolderLoaded={onPublicFolderLoaded!}
          isLoading={isLoadingTracks}
          disabled={false}
        />
      </div>

      {/* Status Card */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-secondary-text font-medium mb-3">Status</p>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-secondary-text">Connection</span>
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
              style={connected
                ? { background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "rgb(52,211,153)" }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border-subtle)", color: "var(--color-secondary-text)" }
              }
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={connected ? { background: "rgb(52,211,153)", boxShadow: "0 0 6px rgba(52,211,153,0.6)", animation: "pulse 2s infinite" } : { background: "rgba(148,163,184,0.4)" }}
              />
              {connected ? "Connected" : "Not connected"}
            </span>
          </div>

          {connected && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-text">Source</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                style={sourceMode === "public"
                  ? { background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", color: "rgb(56,189,248)" }
                  : { background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.2)", color: "rgb(196,181,253)" }
                }
              >
                {sourceMode === "public" ? "Public" : "Private"}
              </span>
            </div>
          )}

          {connected && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary-text">Tracks</span>
              <span className="text-xs font-medium text-primary-text">
                {isLoadingTracks ? (
                  <span className="inline-flex items-center gap-1.5 text-accent">
                    <span className="inline-block h-3 w-3 rounded-full border-[1.5px] border-accent/30 border-t-accent animate-spin" />
                    Loading
                  </span>
                ) : (
                  `${trackCount} file${trackCount !== 1 ? "s" : ""}`
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="glass-card rounded-2xl p-4">
        <p className="text-[10px] uppercase tracking-[0.25em] text-secondary-text font-medium mb-3">Quick Tips</p>
        <div className="space-y-2">
          {[
            { icon: "📁", text: "Select a Drive folder to start" },
            { icon: "🔗", text: "Paste a public link — no login needed" },
            { icon: "🎵", text: "Click any track to begin playback" },
            { icon: "⌨️", text: "Space key to play / pause" },
          ].map((tip) => (
            <div key={tip.text} className="flex items-start gap-2.5">
              <span className="text-sm shrink-0 mt-0.5">{tip.icon}</span>
              <p className="text-[11px] text-secondary-text leading-5">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.aside>
  );
}
