declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    PandaPlayer: any;
  }
}

export interface PandaVideo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  created_at: string;
  embed_id?: string | null;
  player_url?: string | null;
  pullzone_name?: string | null;
}

export interface PandaFolder {
  id: string;
  name: string;
  parent_id?: string;
  created_at: string;
}

export interface VideoEmbedData {
  embedId: string | null;
  playerUrl: string | null;
  pullzoneName: string | null;
}
