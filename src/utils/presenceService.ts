import {
  PresenceResponse,
  ParsedSpotifyData,
  ParsedActivityData,
  SpotifyStatus,
  MiscActivity,
} from "@/types/presence";

const PRESENCE_API_BASE = "https://api.lagden.dev/v1/watcher";

/**
 * Fetches presence data from the Discord presence API
 */
export async function fetchPresenceData(
  userId: string,
  signal?: AbortSignal,
): Promise<PresenceResponse> {
  const response = await fetch(`${PRESENCE_API_BASE}/${userId}`, {
    signal,
    cache: "no-store", // Always fetch fresh data
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch presence data: ${response.status}`);
  }

  return response.json();
}

/**
 * Parses Spotify status data into a more usable format
 */
export function parseSpotifyData(
  spotifyStatus: SpotifyStatus | null,
): ParsedSpotifyData | null {
  if (!spotifyStatus) return null;

  const { track, album } = spotifyStatus;
  const startTime = new Date(track.start);
  const endTime = new Date(track.end);
  const now = new Date();

  // Calculate progress percentage
  const totalDuration = endTime.getTime() - startTime.getTime();
  const elapsed = now.getTime() - startTime.getTime();
  const progress = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));

  // Check if still playing (not past end time)
  const isPlaying = now < endTime;

  return {
    isPlaying,
    trackName: track.name,
    artists: track.artists,
    albumName: album.name,
    albumCover: album.cover_url,
    trackUrl: track.url,
    progress,
    startTime,
    endTime,
  };
}

/**
 * Parses misc activities (like VS Code) into a more usable format
 */
export function parseActivityData(
  activities: MiscActivity[],
): ParsedActivityData[] {
  return activities.map((activity) => {
    const isVscode = activity.name.toLowerCase().includes("code");

    return {
      type: isVscode ? "vscode" : "other",
      name: activity.name,
      details: activity.details,
      state: activity.state || undefined,
      largeImage: activity.assets?.large_image,
      smallImage: activity.assets?.small_image,
      startTime: activity.timestamps?.start
        ? new Date(activity.timestamps.start)
        : undefined,
    };
  });
}

/**
 * Formats duration in MM:SS format
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Gets the primary activity to display (prioritizes Spotify, then VS Code, then others)
 */
export function getPrimaryActivity(
  spotifyData: ParsedSpotifyData | null,
  activities: ParsedActivityData[],
): {
  type: "spotify" | "activity";
  data: ParsedSpotifyData | ParsedActivityData;
} | null {
  // Prioritize Spotify if actively playing
  if (spotifyData?.isPlaying) {
    return { type: "spotify", data: spotifyData };
  }

  // Then look for VS Code activity
  const vscodeActivity = activities.find((a) => a.type === "vscode");
  if (vscodeActivity) {
    return { type: "activity", data: vscodeActivity };
  }

  // Finally, any other activity
  const otherActivity = activities[0];
  if (otherActivity) {
    return { type: "activity", data: otherActivity };
  }

  return null;
}
