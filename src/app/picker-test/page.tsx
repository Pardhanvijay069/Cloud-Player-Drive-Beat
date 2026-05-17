import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { Header } from "@/components/Header";
import { PickerTestPanel } from "@/components/picker-test-panel";
import { authOptions } from "@/lib/auth";

export default async function PickerTestPage() {
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
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PickerTestPanel pickerApiKey={pickerApiKey} pickerAppId={pickerAppId} />
      </main>
    </>
  );
}
