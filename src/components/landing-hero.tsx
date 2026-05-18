"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AuthButton } from "@/components/auth-button";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.1 } },
};

export function LandingHero() {
  return (
    <div className="relative">
      {/* ─── Full-viewport Hero ─── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Ambient background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-[10%] left-[5%] h-[500px] w-[500px] rounded-full bg-accent/10 blur-[150px] animate-pulse" style={{ animationDuration: "4s" }} />
          <div className="absolute bottom-[10%] right-[5%] h-[450px] w-[450px] rounded-full bg-accent-secondary/8 blur-[130px] animate-pulse" style={{ animationDuration: "6s" }} />
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-accent/[0.03] blur-[200px]" />
          {/* Grid pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-2 text-sm text-accent backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
                </span>
                Stream from your Google Drive
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-4xl text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-primary-text leading-[1.05]"
            >
              Your music.{" "}
              <span className="bg-gradient-to-r from-accent via-accent-secondary to-accent bg-[length:200%_auto] animate-gradient bg-clip-text text-transparent">
                Your cloud.
              </span>
              <br />
              <span className="text-secondary-text/80 font-medium">Zero compromises.</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mx-auto max-w-2xl text-lg sm:text-xl text-secondary-text leading-8"
            >
              Turn any Google Drive folder into a premium streaming experience.
              Instant playback, seek support, and smart buffering — all through
              your browser.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <AuthButton />
              <Link
                href="/player"
                className="group inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-elevated/50 px-6 py-3.5 text-sm font-semibold text-primary-text transition-all duration-300 hover:bg-surface-elevated hover:border-border-default hover:shadow-lg hover:shadow-black/10"
              >
                Open Player
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-8 sm:gap-12 pt-4"
            >
              {[
                { value: "Range", label: "Based Streaming" },
                { value: "0ms", label: "Seek Latency" },
                { value: "∞", label: "File Size Support" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-lg sm:text-xl font-bold text-primary-text">{stat.value}</p>
                  <p className="text-[10px] sm:text-xs text-secondary-text uppercase tracking-wider mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="flex flex-col items-center gap-2 text-secondary-text/40"
          >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-text">
              Everything you need. Nothing you don&apos;t.
            </h2>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group glass-card rounded-2xl p-6 transition-all duration-300 hover:border-border-default hover:shadow-lg hover:shadow-black/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent-secondary/10 border border-accent/20 mb-4 transition-transform duration-300 group-hover:scale-110">
                  <span className="text-lg">{feature.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-primary-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-xs text-secondary-text leading-5">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="relative py-24 sm:py-32 border-t border-border-subtle">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-primary-text">
              Three steps to your jukebox
            </h2>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="relative text-center"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-border-default to-transparent" />
                )}
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/15 to-accent-secondary/10 border border-accent/20 mb-5">
                  <span className="text-2xl font-bold bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-primary-text mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-secondary-text leading-5 max-w-xs mx-auto">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative py-24 sm:py-32 border-t border-border-subtle">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[600px] rounded-full bg-accent/6 blur-[150px]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-text">
              Ready to{" "}
              <span className="bg-gradient-to-r from-accent to-accent-secondary bg-clip-text text-transparent">
                press play
              </span>
              ?
            </h2>
            <p className="text-base sm:text-lg text-secondary-text max-w-xl mx-auto">
              Connect your Google account and start streaming in seconds. Or just
              paste a public folder link — no login required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <AuthButton />
              <Link
                href="/player"
                className="inline-flex items-center gap-2 rounded-xl border border-border-subtle bg-surface-elevated/50 px-6 py-3.5 text-sm font-semibold text-primary-text transition-all duration-300 hover:bg-surface-elevated hover:border-border-default"
              >
                Go to Player →
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border-subtle py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-secondary-text text-xs">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-accent">
              <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
              <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
            <span>Drive Beat</span>
            <span className="text-border-default">·</span>
            <span>Cloud Music Player</span>
          </div>
          <p className="text-xs text-secondary-text/60">
            Built with Next.js, Google Drive API & love for music
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Data ─── */

const FEATURES = [
  {
    icon: "🔐",
    title: "Secure OAuth",
    description: "Read-only access to your Google Drive. We never write, delete, or share your files.",
  },
  {
    icon: "🌐",
    title: "Public Folders",
    description: "Paste any public Drive folder link. No login needed — instant streaming for shared playlists.",
  },
  {
    icon: "⚡",
    title: "Range Streaming",
    description: "HTTP Range-based proxy streams audio in chunks. Seek instantly to any position without buffering.",
  },
  {
    icon: "🔍",
    title: "Library Search",
    description: "Search across songs, artists, and albums. Ctrl+K to instantly find any track in your library.",
  },
  {
    icon: "📱",
    title: "Responsive Design",
    description: "Premium experience on every device. Touch-optimized controls for mobile, full layout for desktop.",
  },
  {
    icon: "💾",
    title: "Offline Caching",
    description: "Tracks are intelligently cached using the Cache API. Listen offline with LRU-managed storage.",
  },
];

const STEPS = [
  {
    title: "Connect",
    description: "Sign in with Google OAuth or paste a public folder link. Your files stay in your Drive.",
  },
  {
    title: "Pick a Folder",
    description: "Use the folder picker to select any folder containing audio files. Nested folders are scanned too.",
  },
  {
    title: "Press Play",
    description: "Your playlist builds automatically. Stream with full seek support, queue management, and offline caching.",
  },
];
