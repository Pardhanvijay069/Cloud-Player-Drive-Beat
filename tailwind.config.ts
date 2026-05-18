import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // Legacy tokens kept for backward compatibility
        ink: "#101418",
        mist: "#eef4f2",
        mint: "#8bf0c8",
        coral: "#ff8a6b",
        sky: "#8bc7ff",
        panel: "#162027",
        // Semantic tokens via CSS variables
        accent: "var(--color-accent)",
        "accent-secondary": "var(--color-accent-secondary)",
        "accent-warm": "var(--color-accent-warm)",
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        "surface-glass": "var(--color-surface-glass)",
        "primary-text": "var(--color-primary-text)",
        "secondary-text": "var(--color-secondary-text)",
        "tertiary-text": "var(--color-tertiary-text)",
        "border-subtle": "var(--color-border-subtle)",
        "border-default": "var(--color-border-default)",
        "border-accent": "var(--color-border-accent)",
      },
      boxShadow: {
        glow: "var(--shadow-glow)",
        card: "var(--shadow-card)",
        player: "var(--shadow-player)",
        artwork: "var(--shadow-artwork)",
      },
      backgroundImage: {
        mesh: "radial-gradient(ellipse at 15% 15%, rgba(167,139,250,0.07) 0%, transparent 50%), radial-gradient(ellipse at 85% 10%, rgba(103,232,249,0.05) 0%, transparent 45%), radial-gradient(ellipse at 50% 90%, rgba(249,168,212,0.04) 0%, transparent 50%)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "vinyl-spin": "vinyl-spin 3s linear infinite",
        "gradient-shift": "gradient-shift 6s ease infinite",
        float: "float 4s ease-in-out infinite",
        shimmer: "shimmer 1.8s ease-in-out infinite",
      },
    }
  },
  plugins: []
};

export default config;
