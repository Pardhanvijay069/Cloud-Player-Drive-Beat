import { NextResponse } from "next/server";

/**
 * HEAD handler — returns file metadata for public Drive files
 * without downloading the body. The browser uses this to check
 * if Range requests are supported before starting audio playback.
 */
export async function HEAD(
  _request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const apiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return new NextResponse(null, { status: 500 });
  }

  try {
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}&supportsAllDrives=true`,
      { method: "HEAD" }
    );

    if (!driveResponse.ok) {
      return new NextResponse(null, { status: driveResponse.status });
    }

    const headers = new Headers();
    const contentType =
      driveResponse.headers.get("content-type") || "audio/mpeg";
    const contentLength = driveResponse.headers.get("content-length");

    headers.set("Content-Type", contentType);
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=600"
    );

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(null, { status: 200, headers });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

/**
 * GET handler — streams audio data from public Google Drive files.
 *
 * Uses an API key instead of OAuth, so no user login is required.
 * Supports HTTP Range requests for seek/forward/backward.
 *
 * This is identical in behavior to the authenticated streaming route
 * but uses `key=` query parameter instead of `Authorization` header.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const apiKey = process.env.GOOGLE_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const range = request.headers.get("range");

  try {
    const driveHeaders: Record<string, string> = {};

    // Forward the Range header from the browser to Google Drive.
    if (range) {
      driveHeaders["Range"] = range;
    }

    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}&supportsAllDrives=true`,
      {
        headers: driveHeaders,
        cache: "no-store",
      }
    );

    const isRangeResponse = driveResponse.status === 206;
    const isSuccessResponse = driveResponse.ok;

    if (!isSuccessResponse && !isRangeResponse) {
      const payload = await safeJson(driveResponse);
      const message =
        payload?.error?.message || "Unable to stream file from Google Drive";

      return NextResponse.json(
        { error: message },
        { status: driveResponse.status }
      );
    }

    const headers = new Headers();
    const contentType =
      driveResponse.headers.get("content-type") || "audio/mpeg";
    const contentLength = driveResponse.headers.get("content-length");
    const contentRange = driveResponse.headers.get("content-range");
    const acceptRanges =
      driveResponse.headers.get("accept-ranges") || "bytes";

    headers.set("Content-Type", contentType);
    headers.set("Accept-Ranges", acceptRanges);

    // Public files can be cached more aggressively
    headers.set(
      "Cache-Control",
      "public, max-age=3600, stale-while-revalidate=600"
    );

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const responseStatus = isRangeResponse ? 206 : 200;

    return new Response(driveResponse.body, {
      status: responseStatus,
      headers,
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while streaming audio" },
      { status: 500 }
    );
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
