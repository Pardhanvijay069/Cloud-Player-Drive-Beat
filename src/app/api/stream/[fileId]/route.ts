import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";

/**
 * HEAD handler — returns file metadata (content-type, content-length)
 * without downloading the file body. Used by browsers to determine
 * if Range requests are supported before starting playback.
 */
export async function HEAD(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return new NextResponse(null, { status: 401 });
  }

  if (session.error === "RefreshAccessTokenError") {
    return new NextResponse(null, { status: 401 });
  }

  try {
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      {
        method: "HEAD",
        headers: {
          Authorization: `Bearer ${session.accessToken}`
        }
      }
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

    // Allow caching for 1 hour (private = only user's browser, not CDN)
    // This significantly reduces redundant requests when seeking
    headers.set("Cache-Control", "private, max-age=3600, stale-while-revalidate=600");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    return new NextResponse(null, {
      status: 200,
      headers
    });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}

/**
 * GET handler — streams audio data from Google Drive.
 *
 * Supports HTTP Range requests for:
 * - Partial content (206) responses for seek/forward/backward
 * - Full content (200) responses for initial load
 *
 * The browser's <audio> element automatically sends Range headers.
 * When the user seeks, the browser requests the specific byte range needed.
 *
 * Flow:
 * 1. Browser sends: Range: bytes=12345-
 * 2. This proxy forwards the Range header to Google Drive
 * 3. Drive returns 206 with Content-Range: bytes 12345-99999/100000
 * 4. We proxy that response back with the same headers
 *
 * This enables efficient chunk-based streaming without downloading
 * the entire file upfront.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json({ error: "Session expired" }, { status: 401 });
  }

  const range = request.headers.get("range");

  try {
    const driveHeaders: Record<string, string> = {
      Authorization: `Bearer ${session.accessToken}`,
    };

    // Forward the Range header from the browser to Google Drive.
    // This is what enables chunk-based streaming — Drive will respond
    // with only the requested byte range instead of the full file.
    if (range) {
      driveHeaders["Range"] = range;
    }

    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      {
        headers: driveHeaders,
        cache: "no-store"
      }
    );

    const isRangeResponse = driveResponse.status === 206;
    const isSuccessResponse = driveResponse.ok;

    if (!isSuccessResponse && !isRangeResponse) {
      const payload = await safeJson(driveResponse);
      const message =
        payload?.error?.message || "Unable to stream file from Google Drive";

      return NextResponse.json({ error: message }, { status: driveResponse.status });
    }

    const headers = new Headers();
    const contentType =
      driveResponse.headers.get("content-type") || "audio/mpeg";
    const contentLength = driveResponse.headers.get("content-length");
    const contentRange = driveResponse.headers.get("content-range");
    const acceptRanges = driveResponse.headers.get("accept-ranges") || "bytes";

    headers.set("Content-Type", contentType);
    headers.set("Accept-Ranges", acceptRanges);

    // Cache streamed chunks for 1 hour — crucial for seek performance.
    // When the user seeks backward, the browser can serve the already-fetched
    // bytes from its HTTP cache instead of re-requesting from Drive.
    headers.set("Cache-Control", "private, max-age=3600, stale-while-revalidate=600");

    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    if (contentRange) {
      headers.set("Content-Range", contentRange);
    }

    const responseStatus = isRangeResponse ? 206 : 200;

    return new Response(driveResponse.body, {
      status: responseStatus,
      headers
    });
  } catch (error) {
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
