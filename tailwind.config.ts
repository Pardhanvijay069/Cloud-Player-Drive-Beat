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
        surface: "var(--color-surface)",
        "surface-elevated": "var(--color-surface-elevated)",
        "primary-text": "var(--color-primary-text)",
        "secondary-text": "var(--color-secondary-text)",
        "border-subtle": "var(--color-border-subtle)",
        "border-default": "var(--color-border-default)"
      },
      boxShadow: {
        glow: "0 20px 80px rgba(var(--accent-rgb), 0.18)"
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 20% 20%, rgba(var(--accent-rgb), 0.12), transparent 35%), radial-gradient(circle at 80% 0%, rgba(var(--accent-secondary-rgb), 0.1), transparent 30%), radial-gradient(circle at 80% 80%, rgba(var(--accent-rgb), 0.06), transparent 30%)"
      }
    }
  },
  plugins: []
};

export default config;
