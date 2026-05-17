"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AuthButton } from "@/components/auth-button";

export function LandingHero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-[10%] h-[400px] w-[400px] rounded-full bg-accent/8 blur-[120px]" />
        <div className="absolute bottom-0 right-[10%] h-[350px] w-[350px] rounded-full bg-accent-secondary/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-24">
        {/* Left content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm text-accent"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Stream music directly from your Drive folder
          </motion.div>

          <div className="space-y-5">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-primary-text leading-[1.1]"
            >
              Your personal cloud{" "}
              <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                jukebox
              </span>
              , powered by Google Drive.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="max-w-2xl text-base sm:text-lg leading-7 sm:leading-8 text-secondary-text"
            >
              Connect with Google, pick one folder, and let the app build a playlist
              from supported audio files. Playback is streamed on demand through a secure
              backend proxy with seek support.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <AuthButton />
            <Link
              href="/player"
              className="inline-flex items-center justify-center rounded-xl border border-border-subtle bg-surface-elevated/50 px-5 py-3 text-sm font-semibold text-primary-text transition-all duration-200 hover:bg-surface-elevated hover:border-border-default"
            >
              Open Player →
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="grid gap-3 sm:grid-cols-3"
          >
            {[
              { icon: "🔐", text: "Google OAuth with Drive readonly scope" },
              { icon: "📁", text: "Folder picker for one-click playlist generation" },
              { icon: "🎵", text: "HTTP Range proxy streaming for smooth seeking" }
            ].map((item) => (
              <div
                key={item.text}
                className="glass-card rounded-2xl p-4 text-sm text-secondary-text"
              >
                <span className="text-lg mb-2 block">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right card */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: "easeOut" }}
          className="relative"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/15 via-accent-secondary/10 to-transparent blur-2xl" />
          <div className="relative glass-card rounded-3xl p-6 shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-secondary-text">
                    Session Flow
                  </p>
                  <p className="mt-2 text-xl sm:text-2xl font-semibold text-primary-text">
                    Login. Pick. Press play.
                  </p>
                </div>
                <div className="rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-accent font-medium">
                  V1
                </div>
              </div>
              <div className="space-y-3">
                {[
                  "Authenticate with Google through NextAuth.",
                  "Select a single Drive folder using Google Picker.",
                  "Stream tracks through a range-aware backend endpoint."
                ].map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.15, duration: 0.4 }}
                    className="flex items-start gap-4 rounded-2xl glass-card p-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent-secondary/20 text-sm font-bold text-accent">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-secondary-text">{step}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
