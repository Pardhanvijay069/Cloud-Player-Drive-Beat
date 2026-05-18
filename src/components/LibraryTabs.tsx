"use client";

import React from "react";
import { motion } from "framer-motion";

export type LibraryTab = "songs" | "artists" | "albums" | "queue";

type Props = {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  counts?: {
    songs: number;
    artists: number;
    albums: number;
    queue: number;
  };
};

const TABS: { id: LibraryTab; label: string; icon: React.ReactNode }[] = [
  {
    id: "songs",
    label: "Songs",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "artists",
    label: "Artists",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    id: "albums",
    label: "Albums",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
  },
  {
    id: "queue",
    label: "Up Next",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
  },
];

export function LibraryTabs({ activeTab, onTabChange, counts }: Props) {
  return (
    <div
      className="flex items-center gap-1 rounded-xl p-1"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--color-border-subtle)" }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = counts?.[tab.id] ?? 0;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            type="button"
            className="relative flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200"
            style={{
              color: isActive ? "var(--color-primary-text)" : "var(--color-secondary-text)",
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: "linear-gradient(135deg, rgba(167,139,250,0.15), rgba(103,232,249,0.08))",
                  border: "1px solid rgba(167,139,250,0.2)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
                transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <span className={isActive ? "text-accent" : ""}>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {count > 0 && (
                <span
                  className="inline-flex items-center justify-center min-w-[16px] h-4 rounded-full px-1 text-[9px] tabular-nums font-semibold"
                  style={isActive
                    ? { background: "rgba(167,139,250,0.2)", color: "rgb(196,181,253)" }
                    : { background: "rgba(255,255,255,0.06)", color: "var(--color-secondary-text)" }
                  }
                >
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
