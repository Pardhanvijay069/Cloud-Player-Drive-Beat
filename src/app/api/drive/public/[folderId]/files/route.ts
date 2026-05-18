import { NextResponse } from "next/server";

import {
  fetchPublicFolderFiles,
  fetchPublicFolderMetadata,
} from "@/lib/public-drive";

/**
 * GET /api/drive/public/[folderId]/files
 *
 * Fetches audio files from a publicly shared Google Drive folder
 * using the server-side API key (no OAuth required).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ folderId: string }> }
) {
  const { folderId } = await params;

  // Validate folder ID format
  if (!folderId || !/^[a-zA-Z0-9_-]+$/.test(folderId)) {
    return NextResponse.json(
      { error: "Invalid folder ID format" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error: API key not set" },
      { status: 500 }
    );
  }

  try {
    // First, verify the folder exists and is accessible
    const folderMeta = await fetchPublicFolderMetadata(folderId, apiKey);

    // Fetch all audio files (recursive into subfolders)
    const files = await fetchPublicFolderFiles(folderId, apiKey, {
      recursive: true,
      maxDepth: 3,
    });

    return NextResponse.json({
      folder: {
        id: folderMeta.id,
        name: folderMeta.name,
      },
      files: files.map((file) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size,
        modifiedTime: file.modifiedTime,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to access public folder";

    // Determine appropriate status code from error message
    let status = 500;
    if (message.includes("not found")) status = 404;
    else if (message.includes("Access denied") || message.includes("not shared publicly"))
      status = 403;
    else if (message.includes("Rate limit")) status = 429;
    else if (message.includes("not point to a folder")) status = 400;

    return NextResponse.json({ error: message }, { status });
  }
}
