// app/(portal)/educational/_actions/video-actions.ts
"use client";

import { PandaVideo } from "@/types/panda";

const TRADERS_HOUSE_FOLDER_ID = "d7ae82f8-6cfe-47d4-b131-1137d3c94a18";

// Função auxiliar para extrair o número do título
function getVideoNumber(title: string): number {
  // Procura por um número no início do título
  const match = title.match(/^(?:Aula\s*)?(\d+)/i);
  return match ? parseInt(match[1]) : 9999; // Se não encontrar número, coloca no final
}

export async function getFolderVideos(): Promise<PandaVideo[]> {
  if (!process.env.NEXT_PUBLIC_PANDA_API_KEY) {
    console.error("PANDA_API_KEY não configurada");
    return [];
  }

  try {
    // Busca direta dos vídeos usando o ID da pasta
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
      console.error("Detalhes da resposta:", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error(`Erro ao buscar vídeos: ${response.status}`);
    }

    const data = await response.json();
    console.log("Dados recebidos:", data);
    const videos = data.videos || [];

    // Ordena os vídeos por número extraído do título
    return videos.sort((a: PandaVideo, b: PandaVideo) => {
      const numA = getVideoNumber(a.title);
      const numB = getVideoNumber(b.title);
      return numA - numB;
    });
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    return [];
  }
}
