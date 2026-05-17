import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { getServerSession } from "next-auth";

import { AppSessionProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { authOptions } from "@/lib/auth";

import "./globals.css";

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-body"
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: "Drive Beat — Cloud Music Player",
  description: "Stream music from Google Drive. Connect, pick a folder, and play your audio files with a modern cloud-native player."
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#0a0e14" />
      </head>
      <body className={`${bodyFont.variable} ${displayFont.variable}`}>
        <AppSessionProvider session={session}>
          <ThemeProvider>
            <div className="min-h-screen bg-mesh">{children}</div>
          </ThemeProvider>
        </AppSessionProvider>
      </body>
    </html>
  );
}
