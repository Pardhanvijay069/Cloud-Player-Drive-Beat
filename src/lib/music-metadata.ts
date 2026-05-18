/**
 * Music Metadata Utilities
 *
 * Extracts artist, album, and title info from filenames since
 * we don't have access to ID3 tags from Google Drive metadata.
 *
 * Common filename patterns:
 * - "Artist - Title.mp3"
 * - "01. Artist - Title.mp3"
 * - "Artist - Album - Title.mp3"
 * - "01 Title.mp3"
 * - "Title.mp3"
 */

import type { DriveAudioFile } from "@/lib/google-drive";

export type ParsedTrackMeta = {
  title: string;
  artist: string;
  album: string;
};

export type ArtistGroup = {
  name: string;
  trackCount: number;
  tracks: DriveAudioFile[];
};

export type AlbumGroup = {
  name: string;
  artist: string;
  trackCount: number;
  tracks: DriveAudioFile[];
};

/**
 * Strip the file extension from a filename.
 */
function stripExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, "");
}

/**
 * Remove leading track numbers like "01.", "01 -", "1.", "01 " etc.
 */
function stripLeadingTrackNumber(name: string): string {
  return name.replace(/^\d{1,3}[\.\-\s_]+\s*/, "").trim();
}

/**
 * Parse metadata from a filename.
 */
export function parseTrackMetadata(filename: string): ParsedTrackMeta {
  const base = stripExtension(filename);
  const cleaned = stripLeadingTrackNumber(base);

  // Pattern: "Artist - Album - Title"
  const threePartMatch = cleaned.match(/^(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(.+)$/);
  if (threePartMatch) {
    return {
      artist: threePartMatch[1].trim(),
      album: threePartMatch[2].trim(),
      title: threePartMatch[3].trim(),
    };
  }

  // Pattern: "Artist - Title"
  const twoPartMatch = cleaned.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (twoPartMatch) {
    return {
      artist: twoPartMatch[1].trim(),
      album: "Unknown Album",
      title: twoPartMatch[2].trim(),
    };
  }

  // Fallback: just the filename
  return {
    artist: "Unknown Artist",
    album: "Unknown Album",
    title: cleaned.trim() || base,
  };
}

/**
 * Group tracks by artist.
 */
export function groupByArtist(tracks: DriveAudioFile[]): ArtistGroup[] {
  const artistMap = new Map<string, DriveAudioFile[]>();

  for (const track of tracks) {
    const meta = parseTrackMetadata(track.name);
    const existing = artistMap.get(meta.artist) ?? [];
    existing.push(track);
    artistMap.set(meta.artist, existing);
  }

  return Array.from(artistMap.entries())
    .map(([name, artistTracks]) => ({
      name,
      trackCount: artistTracks.length,
      tracks: artistTracks,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Group tracks by album.
 */
export function groupByAlbum(tracks: DriveAudioFile[]): AlbumGroup[] {
  const albumMap = new Map<string, { artist: string; tracks: DriveAudioFile[] }>();

  for (const track of tracks) {
    const meta = parseTrackMetadata(track.name);
    const key = `${meta.artist}:::${meta.album}`;
    const existing = albumMap.get(key) ?? { artist: meta.artist, tracks: [] };
    existing.tracks.push(track);
    albumMap.set(key, existing);
  }

  return Array.from(albumMap.entries())
    .map(([key, data]) => ({
      name: key.split(":::")[1],
      artist: data.artist,
      trackCount: data.tracks.length,
      tracks: data.tracks,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Search tracks by query matching against title, artist, album, and filename.
 */
export function searchTracks(
  tracks: DriveAudioFile[],
  query: string
): DriveAudioFile[] {
  if (!query.trim()) return tracks;

  const lowerQuery = query.toLowerCase().trim();

  return tracks.filter((track) => {
    const meta = parseTrackMetadata(track.name);
    return (
      track.name.toLowerCase().includes(lowerQuery) ||
      meta.title.toLowerCase().includes(lowerQuery) ||
      meta.artist.toLowerCase().includes(lowerQuery) ||
      meta.album.toLowerCase().includes(lowerQuery)
    );
  });
}
