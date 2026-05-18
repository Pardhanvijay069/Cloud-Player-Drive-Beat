"use client";

import { motion } from "framer-motion";
import type { AlbumGroup } from "@/lib/music-metadata";

type Props = {
  album: AlbumGroup;
  index: number;
  onSelect: (album: AlbumGroup) => void;
};

/** Generate a soft gradient pair from string hash */
function getAlbumGradient(name: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 50) % 360;
  return [
    `hsl(${hue1}, 45%, 30%)`,
    `hsl(${hue2}, 50%, 40%)`,
  ];
}

export function AlbumCard({ album, index, onSelect }: Props) {
  const [color1, color2] = getAlbumGradient(album.name + album.artist);

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.97 }}
      className="group flex flex-col gap-3 rounded-2xl p-4 text-left transition-all duration-300 overflow-hidden"
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
      onClick={() => onSelect(album)}
      type="button"
    >
      {/* Album artwork */}
      <div
        className="flex aspect-square w-full items-center justify-center rounded-xl shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:scale-[1.02] relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${color1}, ${color2})` }}
      >
        {/* Vinyl circles effect */}
        <div className="absolute inset-0 opacity-20" style={{
          background: `
            repeating-radial-gradient(circle at center,
              transparent 0px,
              transparent 6px,
              rgba(255,255,255,0.1) 6px,
              rgba(255,255,255,0.1) 7px
            )
          `
        }} />
        {/* Center label */}
        <div
          className="relative z-10 flex items-center justify-center rounded-full"
          style={{ width: "35%", height: "35%", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)" }}
        >
          <div className="rounded-full" style={{ width: "30%", height: "30%", background: "rgba(255,255,255,0.15)" }} />
        </div>
        {/* Sheen */}
        <div
          className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 60%)" }}
        />
      </div>

      {/* Info */}
      <div className="min-w-0 w-full">
        <p className="truncate text-[13px] font-semibold text-primary-text leading-tight">
          {album.name}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-secondary-text">
          {album.artist}
          <span className="mx-1 text-border-default">·</span>
          {album.trackCount} track{album.trackCount !== 1 ? "s" : ""}
        </p>
      </div>
    </motion.button>
  );
}
