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
    <>
      <Header compact />
      <MusicPlayerShell pickerApiKey={pickerApiKey} pickerAppId={pickerAppId} />
    </>
  );
}
