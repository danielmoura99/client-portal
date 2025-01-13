// lib/panda-video.ts
export class PandaVideoClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.PANDA_API_KEY!;
    this.baseUrl = process.env.PANDA_API_URL!;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "application/json",
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`Panda Video API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Listar todos os vídeos
  async listVideos() {
    return this.fetch("/videos");
  }

  // Buscar detalhes de um vídeo específico
  async getVideo(videoId: string) {
    return this.fetch(`/videos/${videoId}`);
  }

  // Buscar estatísticas de um vídeo
  async getVideoStats(videoId: string) {
    return this.fetch(`/videos/${videoId}/stats`);
  }

  // Buscar pastas/categorias
  async getFolders() {
    return this.fetch("/folders");
  }
}

// Criar uma instância global
export const pandaVideo = new PandaVideoClient();
