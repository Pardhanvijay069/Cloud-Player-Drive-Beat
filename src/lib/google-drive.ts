const SUPPORTED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".flac"];

export type DriveAudioFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
};

export function isSupportedAudioFile(file: DriveAudioFile) {
  const lowerName = file.name.toLowerCase();
  return (
    file.mimeType.startsWith("audio/") ||
    SUPPORTED_AUDIO_EXTENSIONS.some((extension) => lowerName.endsWith(extension))
  );
}

export async function fetchGoogleDrive<T>(
  input: string,
  accessToken: string,
  init?: RequestInit
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const payload = await safeJson(response);
    const message =
      payload?.error?.message ||
      payload?.error_description ||
      "Google Drive request failed";

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
