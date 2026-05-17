"use client";

import { motion, AnimatePresence } from "framer-motion";
import { DriveFolderPicker } from "@/components/DriveFolderPicker";

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
  trackCount = 0
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-surface-elevated/98 border-r border-border-subtle shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-accent/30">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent">
                    <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <span className="text-sm font-semibold text-primary-text">Drive Beat</span>
              </div>
              <button
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface/60 text-secondary-text transition hover:text-primary-text"
                type="button"
                aria-label="Close menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-5 space-y-5">
              {/* Folder Picker */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-sm font-semibold text-primary-text mb-3">Drive Source</p>
                {connected ? (
                  <button
                    onClick={() => {
                      onClearFolder?.();
                      onClose();
                    }}
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

              {/* Status */}
              <div className="glass-card rounded-2xl p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-secondary-text font-medium mb-3">Status</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-secondary-text">Connection</span>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                      connected
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-surface text-secondary-text border border-border-subtle"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-400" : "bg-secondary-text/50"}`} />
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
                        {isLoadingTracks ? "Loading..." : `${trackCount} audio file${trackCount !== 1 ? "s" : ""}`}
                      </p>
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
