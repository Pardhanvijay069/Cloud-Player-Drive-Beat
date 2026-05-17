import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";

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
    headers.set("Cache-Control", "private, no-store");

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
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&supportsAllDrives=true`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          ...(range ? { Range: range } : {})
        },
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
    headers.set("Cache-Control", "private, no-store");

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
