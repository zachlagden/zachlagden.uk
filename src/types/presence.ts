export interface PresenceResponse {
  ok: boolean;
  presence_data: PresenceData;
  user_data: UserData;
}

export interface PresenceData {
  active_platforms: ActivePlatforms;
  custom_status: CustomStatus | null;
  misc_activities: MiscActivity[];
  spotify_status: SpotifyStatus | null;
  statuses: Statuses;
}

export interface ActivePlatforms {
  desktop: boolean;
  mobile: boolean;
  web: boolean;
}

export interface CustomStatus {
  name: string;
  emoji: string | null;
  state: string;
  created_at: string;
}

export interface MiscActivity {
  application_id: number;
  assets?: ActivityAssets;
  created_at: string;
  details?: string;
  name: string;
  state?: string | null;
  timestamps?: ActivityTimestamps;
  type: string;
}

export interface ActivityAssets {
  large_image?: string;
  large_text?: string | null;
  small_image?: string;
  small_text?: string;
}

export interface ActivityTimestamps {
  end?: number | null;
  start?: number;
}

export interface SpotifyStatus {
  activity: SpotifyActivity;
  album: SpotifyAlbum;
  track: SpotifyTrack;
}

export interface SpotifyActivity {
  color: SpotifyColor;
  created_at: string;
  party_id: string;
  title: string;
  type: string;
}

export interface SpotifyColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

export interface SpotifyAlbum {
  cover_url: string;
  name: string;
}

export interface SpotifyTrack {
  artists: string[];
  end: string;
  name: string;
  start: string;
  url: string;
}

export interface Statuses {
  desktop: string;
  mobile: string;
  raw_status: string;
  status: string;
  web: string;
}

export interface UserData {
  accent_color: number | null;
  accent_colour: number | null;
  avatar: UserAvatar;
  avatar_decoration: string;
  avatar_decoration_sku_id: number | null;
  banner: string | null;
  color: SpotifyColor;
  created_at: string;
  discriminator: string;
  display_avatar: string;
  display_name: string;
  global_name: string;
  id: number;
  mention: string;
  name: string;
  public_flags: number;
}

export interface UserAvatar {
  key: string;
  url: string;
}

// Utility types for components
export interface ParsedSpotifyData {
  isPlaying: boolean;
  trackName: string;
  artists: string[];
  albumName: string;
  albumCover: string;
  trackUrl: string;
  progress: number; // 0-100
  startTime: Date;
  endTime: Date;
}

export interface ParsedActivityData {
  type: "vscode" | "other";
  name: string;
  details?: string;
  state?: string;
  largeImage?: string;
  smallImage?: string;
  startTime?: Date;
}
