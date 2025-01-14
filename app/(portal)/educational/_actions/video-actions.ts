// app/(portal)/educational/_actions/video-actions.ts
"use client";

import { PandaVideo, VideoEmbedData } from "@/types/panda";

const TRADERS_HOUSE_FOLDER_ID = "8d01f885-23e4-4f85-baae-5ef395a2a517";

function getVideoNumber(title: string): number {
  const match = title.match(/^(?:Aula\s*)?(\d+)/i);
  return match ? parseInt(match[1]) : 9999;
}

export async function getVideoEmbed(videoId: string): Promise<VideoEmbedData> {
  try {
    const response = await fetch(
      `https://api-v2.pandavideo.com.br/videos/${videoId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: process.env.NEXT_PUBLIC_PANDA_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar detalhes do vídeo: ${response.status}`);
    }

    const data = await response.json();

    return {
      embedId: data.video_external_id || null,
      playerUrl: data.video_player || null,
      pullzoneName: data.pullzone_name || null,
    };
  } catch (error) {
    console.error("Erro ao buscar embed do vídeo:", error);
    return {
      embedId: null,
      playerUrl: null,
      pullzoneName: null,
    };
  }
}

export async function getFolderVideos(): Promise<PandaVideo[]> {
  if (!process.env.NEXT_PUBLIC_PANDA_API_KEY) {
    console.error("PANDA_API_KEY não configurada");
    return [];
  }

  try {
    const response = await fetch(
      `https://api-v2.pandavideo.com.br/videos?folder_id=${TRADERS_HOUSE_FOLDER_ID}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: process.env.NEXT_PUBLIC_PANDA_API_KEY,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar vídeos: ${response.status}`);
    }

    const data = await response.json();
    const videos = data.videos || [];

    // Busca o embed_id para cada vídeo
    const videosWithEmbed = await Promise.all(
      videos.map(async (video: PandaVideo) => {
        const videoData = await getVideoEmbed(video.id);
        return {
          ...video,
          embed_id: videoData.embedId,
          player_url: videoData.playerUrl,
          pullzone_name: videoData.pullzoneName,
        };
      })
    );

    return videosWithEmbed.sort((a, b) => {
      const numA = getVideoNumber(a.title);
      const numB = getVideoNumber(b.title);
      return numA - numB;
    });
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return [];
  }
}
