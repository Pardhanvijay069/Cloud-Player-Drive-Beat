import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Header } from "@/components/Header";
import { MusicPlayerShell } from "@/components/music-player-shell";
import { authOptions } from "@/lib/auth";

export default async function PlayerPage() {
  const session = await getServerSession(authOptions);
  const pickerApiKey =
    process.env.GOOGLE_PICKER_API_KEY?.trim() ||
    process.env.GOOGLE_API_KEY?.trim() ||
    "";
  const pickerAppId = process.env.GOOGLE_PICKER_APP_ID?.trim() || "";

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col" style={{ height: "100dvh", overflow: "hidden" }}>
      <Header compact />
      <div className="flex-1 overflow-hidden min-h-0">
        <MusicPlayerShell pickerApiKey={pickerApiKey} pickerAppId={pickerAppId} />
      </div>
    </div>
  );
}
