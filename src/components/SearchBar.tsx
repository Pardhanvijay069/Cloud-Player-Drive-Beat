"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Search songs, artists, albums…",
  resultCount,
}: Props) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape" && isFocused) {
        inputRef.current?.blur();
        if (value) onChange("");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFocused, value, onChange]);

  const handleClear = useCallback(() => {
    onChange("");
    inputRef.current?.focus();
  }, [onChange]);

  return (
    <div className="relative w-full">
      <div
        className="relative flex items-center rounded-xl transition-all duration-200"
        style={{
          background: isFocused
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.03)",
          border: isFocused
            ? "1px solid rgba(167,139,250,0.35)"
            : "1px solid var(--color-border-subtle)",
          boxShadow: isFocused
            ? "0 0 0 3px rgba(167,139,250,0.08), 0 4px 16px rgba(0,0,0,0.15)"
            : undefined,
        }}
      >
        {/* Search icon */}
        <div className="pointer-events-none flex items-center pl-3.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="transition-colors duration-200"
            style={{ color: isFocused ? "var(--color-accent)" : "var(--color-secondary-text)" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-2.5 pl-2.5 pr-2 text-[13px] text-primary-text placeholder:text-secondary-text/40 focus:outline-none"
          id="global-search"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Right side */}
        <div className="flex items-center pr-3 gap-1.5">
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded-md text-secondary-text transition-colors hover:text-primary-text"
                style={{ background: "rgba(255,255,255,0.08)" }}
                aria-label="Clear search"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {!value && !isFocused && (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[10px] text-secondary-text/50 font-mono"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--color-border-subtle)" }}
            >
              ⌘K
            </kbd>
          )}

          {value && resultCount !== undefined && (
            <span className="text-[10px] text-secondary-text/60 tabular-nums">
              {resultCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
