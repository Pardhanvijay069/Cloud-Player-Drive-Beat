"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onFolderLoaded: (data: {
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
  isLoading?: boolean;
  disabled?: boolean;
};

type PublicFolderResponse = {
  folder: { id: string; name: string };
  files: Array<{
    id: string;
    name: string;
    mimeType: string;
    size?: string;
    modifiedTime?: string;
  }>;
  error?: string;
};

function extractFolderIdFromUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // Raw folder ID
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return trimmed;

  const patterns = [
    /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/,
    /drive\.google\.com\/folderview\?id=([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

export function PublicFolderInput({ onFolderLoaded, isLoading = false, disabled = false }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Clear success after 4s
  useEffect(() => {
    if (success) {
      successTimerRef.current = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(successTimerRef.current);
    }
  }, [success]);

  const handleSubmit = useCallback(async () => {
    setError(null);
    setSuccess(null);

    const folderId = extractFolderIdFromUrl(inputValue);
    if (!folderId) {
      setError("Please paste a valid Google Drive folder link or folder ID.");
      return;
    }

    setIsFetching(true);

    try {
      const response = await fetch(`/api/drive/public/${folderId}/files`, {
        cache: "no-store",
      });

      const data = (await response.json()) as PublicFolderResponse;

      if (!response.ok) {
        throw new Error(data.error || "Unable to access this folder");
      }

      if (!data.files || data.files.length === 0) {
        setError("No audio files found in this folder.");
        return;
      }

      setSuccess(
        `Loaded ${data.files.length} track${data.files.length !== 1 ? "s" : ""} from "${data.folder.name}"`
      );
      setInputValue("");

      onFolderLoaded({
        folderId: data.folder.id,
        folderName: data.folder.name,
        files: data.files,
      });
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to load folder"
      );
    } finally {
      setIsFetching(false);
    }
  }, [inputValue, onFolderLoaded]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isFetching && !disabled) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const pasted = e.clipboardData.getData("text");
      if (pasted && extractFolderIdFromUrl(pasted)) {
        // Auto-submit on paste if it's a valid URL
        setTimeout(() => {
          setInputValue(pasted);
          handleSubmit();
        }, 100);
      }
    },
    [handleSubmit]
  );

  const busy = isFetching || isLoading;

  return (
    <div className="space-y-3">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-secondary-text"
            >
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError(null);
              setSuccess(null);
            }}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Paste public Drive folder link..."
            disabled={busy || disabled}
            className="w-full rounded-xl border border-border-subtle bg-surface/60 py-2.5 pl-9 pr-3 text-sm text-primary-text placeholder:text-secondary-text/50 transition-all duration-200 focus:border-accent/50 focus:bg-surface focus:outline-none focus:ring-1 focus:ring-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
            id="public-folder-input"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          disabled={busy || disabled || !inputValue.trim()}
          type="button"
          className="flex h-[42px] items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-4 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition-all duration-200 hover:shadow-accent/35 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed shrink-0"
        >
          {busy ? (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          ) : (
            <>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
              </svg>
              Load
            </>
          )}
        </motion.button>
      </div>

      {/* Status messages */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="text-red-400 shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <p className="text-xs text-red-400 leading-5">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="text-emerald-400 shrink-0 mt-0.5"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
            <p className="text-xs text-emerald-400 leading-5">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <p className="text-[10px] text-secondary-text/60 leading-4">
        Supports links like: drive.google.com/drive/folders/...
      </p>
    </div>
  );
}
