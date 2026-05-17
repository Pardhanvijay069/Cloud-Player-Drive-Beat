import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import {
  fetchGoogleDrive,
  isSupportedAudioFile,
  type DriveAudioFile
} from "@/lib/google-drive";

type DriveListResponse = {
  files?: DriveAudioFile[];
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }


  try {
    const query = encodeURIComponent(`'${folderId}' in parents and trashed=false`);
    const fields = encodeURIComponent("files(id,name,mimeType,size,modifiedTime)");
    const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&pageSize=1000&includeItemsFromAllDrives=true&supportsAllDrives=true`;
    const data = await fetchGoogleDrive<DriveListResponse>(driveUrl, session.accessToken);

    const files = (data.files ?? [])
      .filter(isSupportedAudioFile)
      .map((file) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        modifiedTime: file.modifiedTime
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json(files);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load folder contents";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
