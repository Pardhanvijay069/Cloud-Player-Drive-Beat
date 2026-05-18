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
        transition={{ duration: 0.6, ease: [0.19, 1, 0.22, 1] }}
        className="sticky top-0 z-40 header-glass"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="relative flex h-10 w-10 items-center justify-center rounded-2xl overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(103,232,249,0.15))",
                border: "1px solid rgba(167,139,250,0.25)",
              }}
            >
              {/* Inner glow */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: "radial-gradient(circle at center, rgba(167,139,250,0.2), transparent 70%)" }} />
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-accent relative z-10">
                <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </motion.div>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-[0.3em] text-secondary-text font-medium">Cloud Player</p>
              <p className={`font-semibold text-primary-text tracking-tight ${compact ? "text-sm" : "text-[15px]"}`}>
                Drive Beat
              </p>
            </div>
          </Link>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {session && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSettingsOpen(true)}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-secondary-text transition-all duration-200 hover:text-primary-text"
                style={{ background: "var(--color-surface-glass)", border: "1px solid var(--color-border-subtle)" }}
                type="button"
                aria-label="Settings"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </motion.button>
            )}

            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-xs font-semibold text-primary-text shrink-0"
              style={{ border: "1.5px solid var(--color-border-subtle)", background: "var(--color-surface-elevated)" }}
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="User avatar" className="h-full w-full object-cover" src={avatarUrl} />
              ) : (
                <span className="gradient-text font-bold">{nameFallback}</span>
              )}
            </motion.div>

            {/* Auth button */}
            {session ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="hidden sm:block rounded-xl px-4 py-2 text-[13px] font-medium text-secondary-text transition-all duration-200 hover:text-red-400"
                style={{ background: "var(--color-surface-glass)", border: "1px solid var(--color-border-subtle)" }}
                onClick={() => signOut({ callbackUrl: "/" })}
                type="button"
              >
                Sign out
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-xl px-5 py-2 text-[13px] font-semibold text-white shadow-lg transition-all duration-200"
                style={{ background: "linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary))", boxShadow: "0 4px 16px rgba(var(--accent-rgb), 0.3)" }}
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
