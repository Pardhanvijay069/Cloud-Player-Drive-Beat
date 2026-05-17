"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";

type Props = {
  onClose: () => void;
};

export function SettingsModal({ onClose }: Props) {
  const { theme, toggleTheme } = useTheme();

  const clearSavedFolder = () => {
    localStorage.removeItem("cloudmusic-folder");
    window.location.reload();
  };

  const clearLastPlayed = () => {
    localStorage.removeItem("cloudmusic-lastplayed");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-border-subtle bg-surface-elevated/95 p-6 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-secondary-text transition-colors hover:bg-surface-elevated hover:text-primary-text"
          type="button"
          aria-label="Close settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <h2 className="text-xl font-semibold text-primary-text">Settings</h2>
        <p className="mt-1 text-sm text-secondary-text">Customize your experience</p>

        <div className="mt-6 space-y-4">
          {/* Theme toggle */}
          <div className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                {theme === "dark" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-primary-text">Appearance</p>
                <p className="text-xs text-secondary-text">{theme === "dark" ? "Dark mode" : "Light mode"}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className={`relative h-7 w-12 rounded-full transition-colors duration-300 ${
                theme === "dark" ? "bg-accent" : "bg-secondary-text/30"
              }`}
              type="button"
              aria-label="Toggle theme"
            >
              <motion.div
                className="absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-md"
                animate={{ left: theme === "dark" ? "calc(100% - 26px)" : "2px" }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Clear saved folder */}
          <button
            onClick={clearSavedFolder}
            className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-surface/60 p-4 text-left transition-colors hover:bg-surface-elevated/80"
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
                <line x1="9" y1="14" x2="15" y2="14"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-text">Clear Saved Folder</p>
              <p className="text-xs text-secondary-text">Reset connected Drive folder</p>
            </div>
          </button>

          {/* Clear last played */}
          <button
            onClick={clearLastPlayed}
            className="flex w-full items-center gap-3 rounded-2xl border border-border-subtle bg-surface/60 p-4 text-left transition-colors hover:bg-surface-elevated/80"
            type="button"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-text">Clear Last Played</p>
              <p className="text-xs text-secondary-text">Forget last played song</p>
            </div>
          </button>

          {/* About */}
          <div className="rounded-2xl border border-border-subtle bg-surface/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-primary-text">Drive Beat</p>
                <p className="text-xs text-secondary-text">v1.0 · Cloud Music Player</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-secondary-text">
              Stream music directly from Google Drive. Built with Next.js, NextAuth, and the Google Drive API.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
