"use client";

import Link from "next/link";
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SettingsModal } from "@/components/SettingsModal";

type Props = {
  compact?: boolean;
};

export function Header({ compact = false }: Props) {
  const { data: session } = useSession();
  const avatarUrl = session?.user?.image || "";
  const nameFallback = session?.user?.name?.charAt(0).toUpperCase() || "U";
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-40 header-glass"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 border border-accent/30 transition-all duration-300 group-hover:border-accent/50 group-hover:shadow-[0_0_20px_rgba(var(--accent-rgb),0.3)]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-accent">
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-secondary-text font-medium">Cloud Player</p>
              <p className={`font-semibold text-primary-text ${compact ? "text-sm" : "text-base"}`}>
                Drive Beat
              </p>
            </div>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {session && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettingsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-elevated/60 border border-border-subtle text-secondary-text transition-all duration-200 hover:bg-surface-elevated hover:text-primary-text hover:border-border-default"
                type="button"
                aria-label="Settings"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </motion.button>
            )}

            {/* Avatar */}
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-border-subtle bg-surface-elevated text-sm font-semibold text-primary-text">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="User avatar" className="h-full w-full object-cover" src={avatarUrl} />
              ) : (
                <span>{nameFallback}</span>
              )}
            </div>

            {/* Auth button */}
            {session ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl border border-border-subtle bg-surface-elevated/60 px-4 py-2 text-sm font-medium text-secondary-text transition-all duration-200 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                onClick={() => signOut({ callbackUrl: "/" })}
                type="button"
              >
                Logout
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl bg-gradient-to-r from-accent to-accent-secondary px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:shadow-accent/40"
                onClick={() => signIn("google", { callbackUrl: "/player" })}
                type="button"
              >
                Sign In
              </motion.button>
            )}
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal onClose={() => setSettingsOpen(false)} />
        )}
      </AnimatePresence>
    </>
  );
}
