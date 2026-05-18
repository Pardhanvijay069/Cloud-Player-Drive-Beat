"use client";

import { motion } from "framer-motion";
import { useTheme } from "@/components/providers/theme-provider";

type Props = {
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
};

export function ThemeToggle({ size = "md", showLabel = false, className = "" }: Props) {
  const { theme, toggleTheme } = useTheme();

  const trackSize = size === "sm" ? "h-6 w-10" : "h-7 w-12";
  const thumbSize = size === "sm" ? "h-5 w-5" : "h-6 w-6";
  const thumbOffset = size === "sm"
    ? (theme === "dark" ? "calc(100% - 22px)" : "2px")
    : (theme === "dark" ? "calc(100% - 26px)" : "2px");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <span className="text-sm text-secondary-text">
          {theme === "dark" ? "Dark" : "Light"}
        </span>
      )}
      <button
        onClick={toggleTheme}
        className={`relative ${trackSize} rounded-full transition-all duration-300`}
        style={{
          background: theme === "dark"
            ? "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))"
            : "rgba(100,116,139,0.3)",
        }}
        type="button"
        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        <motion.div
          className={`absolute top-0.5 ${thumbSize} rounded-full bg-white shadow-md flex items-center justify-center`}
          animate={{ left: thumbOffset }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {theme === "dark" ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          )}
        </motion.div>
      </button>
    </div>
  );
}
