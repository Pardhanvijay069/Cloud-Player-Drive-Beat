"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DriveFolderPicker } from "@/components/DriveFolderPicker";
import { PublicFolderInput } from "@/components/PublicFolderInput";

type FolderSelection = {
  id: string;
  name?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
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

export function MobileDrawer({
  open,
  onClose,
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
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 lg:hidden"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-md"
            style={{ background: "color-mix(in srgb, var(--color-bg) 68%, transparent)" }}
          />

          {/* Drawer panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm overflow-y-auto"
            style={{
              background: "var(--color-surface-frost)",
              backdropFilter: "blur(32px) saturate(180%)",
              WebkitBackdropFilter: "blur(32px) saturate(180%)",
              borderRight: "1px solid var(--color-border-subtle)",
              boxShadow: "8px 0 40px rgba(0,0,0,0.4)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-5"
              style={{ borderBottom: "1px solid var(--color-border-subtle)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(103,232,249,0.15))",
                    border: "1px solid rgba(167,139,250,0.25)",
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className="text-accent">
                    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-sm font-bold text-primary-text tracking-tight">Drive Beat</span>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary-text transition-all hover:text-primary-text"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border-subtle)" }}
                type="button"
                aria-label="Close menu"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Drive source */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                    style={{ background: "rgba(167,139,250,0.12)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                    </svg>
                  </div>
                  <p className="text-[11px] font-semibold text-primary-text uppercase tracking-wider">Drive Source</p>
                </div>
                {connected ? (
                  <button
                    onClick={() => {
                      onClearFolder?.();
                      onClose();
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200"
                    style={{
                      background: "rgba(251,146,60,0.1)",
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
                    onFolderChosen={(selection) => {
                      onFolderSelected(selection);
                      onClose();
                    }}
                    pickerApiKey={pickerApiKey}
                    pickerAppId={pickerAppId}
                    showSelectedPreview={false}
                  />
                )}
              </div>

              {/* Public folder */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)" }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-lg shrink-0"
                    style={{ background: "rgba(103,232,249,0.10)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-secondary">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-primary-text uppercase tracking-wider">Public Folder</p>
                    <p className="text-[10px] text-secondary-text">No login required</p>
                  </div>
                </div>
                {onPublicFolderLoaded && (
                  <PublicFolderInput
                    onFolderLoaded={(data) => {
                      onPublicFolderLoaded(data);
                      onClose();
                    }}
                    isLoading={isLoadingTracks}
                    disabled={false}
                  />
                )}
              </div>

              {/* Status */}
              <div
                className="rounded-2xl p-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)" }}
              >
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
                        style={connected ? { background: "rgb(52,211,153)" } : { background: "rgba(148,163,184,0.4)" }}
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
                        {isLoadingTracks ? "Loading..." : `${trackCount} file${trackCount !== 1 ? "s" : ""}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
