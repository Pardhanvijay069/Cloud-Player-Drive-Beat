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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 24 }}
        transition={{ duration: 0.3, ease: [0.19, 1, 0.22, 1] }}
        className="relative w-full max-w-md rounded-3xl p-6 glass-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl text-secondary-text transition-all hover:text-primary-text"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--color-border-subtle)" }}
          type="button"
          aria-label="Close settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>

        <div className="mb-1">
          <span className="gradient-text text-lg font-bold tracking-tight">Settings</span>
        </div>
        <p className="text-sm text-secondary-text mb-6">Customize your experience</p>

        <div className="space-y-3">
          {/* Theme toggle */}
          <div
            className="flex items-center justify-between rounded-2xl p-4 transition-all duration-200"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.2)" }}
              >
                {theme === "dark" ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-accent">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-primary-text">Appearance</p>
                <p className="text-xs text-secondary-text">{theme === "dark" ? "Dark mode active" : "Light mode active"}</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="relative h-7 w-12 rounded-full transition-all duration-300 shrink-0"
              style={{
                background: theme === "dark"
                  ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))"
                  : "rgba(100,116,139,0.3)",
              }}
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
            className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200 hover:border-orange-500/20"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)" }}
            type="button"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ background: "rgba(251,146,60,0.1)", border: "1px solid rgba(251,146,60,0.2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-orange-400">
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
            className="flex w-full items-center gap-3 rounded-2xl p-4 text-left transition-all duration-200 hover:border-rose-500/20"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-subtle)" }}
            type="button"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{ background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-rose-400">
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
          <div
            className="rounded-2xl p-4"
            style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(103,232,249,0.15))", border: "1px solid rgba(167,139,250,0.25)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-accent">
                  <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                  <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold gradient-text">Drive Beat</p>
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
