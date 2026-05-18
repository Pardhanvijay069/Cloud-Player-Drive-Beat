/**
 * Public Google Drive folder utilities.
 *
 * Uses the Google Drive API v3 with an API key (no OAuth) to list files
 * in publicly shared folders and stream their content.
 */

// ─── URL Parsing ───────────────────────────────────────────────────────────────

const FOLDER_URL_PATTERNS = [
  // https://drive.google.com/drive/folders/FOLDER_ID
  // https://drive.google.com/drive/folders/FOLDER_ID?usp=sharing
  /drive\.google\.com\/drive\/folders\/([a-zA-Z0-9_-]+)/,
  // https://drive.google.com/open?id=FOLDER_ID
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  // https://drive.google.com/drive/u/0/folders/FOLDER_ID
  /drive\.google\.com\/drive\/u\/\d+\/folders\/([a-zA-Z0-9_-]+)/,
  // https://drive.google.com/folderview?id=FOLDER_ID
  /drive\.google\.com\/folderview\?id=([a-zA-Z0-9_-]+)/,
];

/**
 * Extract a Google Drive folder ID from various URL formats.
 * Returns `null` if the input is not a recognized Drive folder URL.
 */
export function extractFolderIdFromUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it looks like a raw folder ID (no slashes, no dots)
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) {
    return trimmed;
  }

  for (const pattern of FOLDER_URL_PATTERNS) {
    const match = trimmed.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Validate that a string looks like a proper Google Drive URL (basic sanitisation).
 */
export function isValidDriveUrl(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed) return false;

  // Raw folder ID
  if (/^[a-zA-Z0-9_-]{10,}$/.test(trimmed)) return true;

  try {
    const url = new URL(trimmed);
    return url.hostname === "drive.google.com";
  } catch {
    return false;
  }
}

// ─── API Helpers ───────────────────────────────────────────────────────────────

const AUDIO_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/flac",
  "audio/x-flac",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/webm",
];

const AUDIO_EXTENSIONS = [".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac", ".wma", ".opus", ".webm"];

/**
 * Build the MIME type query fragment for the Drive API.
 * We query for audio/* types plus known audio extensions by name.
 */
function buildAudioMimeQuery(): string {
  return AUDIO_MIME_TYPES.map((mime) => `mimeType='${mime}'`).join(" or ");
}

export type PublicDriveFile = {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
  parents?: string[];
};

type DriveListResponse = {
  files?: PublicDriveFile[];
  nextPageToken?: string;
  error?: {
    code: number;
    message: string;
    errors?: Array<{ reason: string; message: string }>;
  };
};

type DriveFolderMetadata = {
  id: string;
  name: string;
  mimeType: string;
  error?: {
    code: number;
    message: string;
  };
};

/**
 * Check if a file name has a supported audio extension.
 */
function hasAudioExtension(name: string): boolean {
  const lowerName = name.toLowerCase();
  return AUDIO_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

/**
 * Check if a file is an audio file (by MIME type or extension).
 */
export function isAudioFile(file: PublicDriveFile): boolean {
  if (file.mimeType.startsWith("audio/")) return true;
  return hasAudioExtension(file.name);
}

/**
 * Fetch metadata for a public folder.
 */
export async function fetchPublicFolderMetadata(
  folderId: string,
  apiKey: string
): Promise<DriveFolderMetadata> {
  const fields = encodeURIComponent("id,name,mimeType");
  const url = `https://www.googleapis.com/drive/v3/files/${folderId}?fields=${fields}&key=${apiKey}&supportsAllDrives=true`;

  const response = await fetch(url, { cache: "no-store" });
  const data = (await response.json()) as DriveFolderMetadata;

  if (!response.ok) {
    const errMsg = data.error?.message || "Unable to access folder";
    const errCode = data.error?.code || response.status;

    if (errCode === 404) {
      throw new Error("Folder not found. Make sure it exists and is shared publicly.");
    }
    if (errCode === 403) {
      throw new Error("Access denied. This folder is not shared publicly.");
    }
    throw new Error(errMsg);
  }

  if (data.mimeType !== "application/vnd.google-apps.folder") {
    throw new Error("The provided link does not point to a folder.");
  }

  return data;
}

/**
 * Fetch all audio files from a public Google Drive folder.
 * Supports pagination and optionally recurses into nested subfolders.
 */
export async function fetchPublicFolderFiles(
  folderId: string,
  apiKey: string,
  options: { recursive?: boolean; maxDepth?: number } = {}
): Promise<PublicDriveFile[]> {
  const { recursive = true, maxDepth = 3 } = options;
  const allFiles: PublicDriveFile[] = [];

  async function fetchFolder(currentFolderId: string, depth: number) {
    // Build query: audio files OR subfolders in parent
    const audioQuery = buildAudioMimeQuery();
    const folderQuery = `mimeType='application/vnd.google-apps.folder'`;
    const parentQuery = `'${currentFolderId}' in parents and trashed=false`;
    const fullQuery = `${parentQuery} and (${audioQuery} or ${folderQuery})`;

    const fields = encodeURIComponent(
      "files(id,name,mimeType,size,modifiedTime),nextPageToken"
    );
    let pageToken: string | undefined;

    do {
      const pageParam = pageToken ? `&pageToken=${pageToken}` : "";
      const url =
        `https://www.googleapis.com/drive/v3/files?` +
        `q=${encodeURIComponent(fullQuery)}` +
        `&fields=${fields}` +
        `&pageSize=1000` +
        `&key=${apiKey}` +
        `&supportsAllDrives=true` +
        `&includeItemsFromAllDrives=true` +
        `&orderBy=name` +
        pageParam;

      const response = await fetch(url, { cache: "no-store" });
      const data = (await response.json()) as DriveListResponse;

      if (!response.ok) {
        const errCode = data.error?.code || response.status;
        const errMsg = data.error?.message || "Unable to list folder contents";

        if (errCode === 404) {
          throw new Error("Folder not found. Make sure it exists and is shared publicly.");
        }
        if (errCode === 403) {
          throw new Error("Access denied. This folder is not shared publicly.");
        }
        if (errCode === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        throw new Error(errMsg);
      }

      const files = data.files ?? [];
      const subfolders: PublicDriveFile[] = [];

      for (const file of files) {
        if (file.mimeType === "application/vnd.google-apps.folder") {
          subfolders.push(file);
        } else if (isAudioFile(file)) {
          allFiles.push(file);
        }
      }

      // Recurse into subfolders if enabled
      if (recursive && depth < maxDepth) {
        for (const subfolder of subfolders) {
          await fetchFolder(subfolder.id, depth + 1);
        }
      }

      pageToken = data.nextPageToken;
    } while (pageToken);
  }

  await fetchFolder(folderId, 0);

  // Sort all files alphabetically
  return allFiles.sort((a, b) => a.name.localeCompare(b.name));
}
