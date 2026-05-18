"use client";

import { motion } from "framer-motion";
import type { ArtistGroup } from "@/lib/music-metadata";

type Props = {
  artist: ArtistGroup;
  index: number;
  onSelect: (artist: ArtistGroup) => void;
};

/** Generate a soft gradient from a string hash */
function getAvatarGradient(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60) % 360;
  return [`hsl(${hue1}, 50%, 32%)`, `hsl(${hue2}, 55%, 42%)`];
}

export function ArtistCard({ artist, index, onSelect }: Props) {
  const initials = artist.name
    .split(/[\s&]+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

  const [color1, color2] = getAvatarGradient(artist.name);

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all duration-300 overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid var(--color-border-subtle)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.2)";
        (e.currentTarget as HTMLElement).style.background = "rgba(167,139,250,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--color-border-subtle)";
        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
      }}
      onClick={() => onSelect(artist)}
      type="button"
    >
      {/* Avatar circle */}
      <div
        className="relative flex h-16 w-16 items-center justify-center rounded-full text-base font-bold text-white/90 shadow-lg transition-all duration-300 group-hover:scale-105"
        style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
      >
        {initials || "?"}
        {/* Sheen */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 60%)" }}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 w-full">
        <p className="truncate text-[13px] font-semibold text-primary-text leading-tight">
          {artist.name}
        </p>
        <p className="mt-0.5 text-[11px] text-secondary-text">
          {artist.trackCount} track{artist.trackCount !== 1 ? "s" : ""}
        </p>
      </div>
    </motion.button>
  );
}
