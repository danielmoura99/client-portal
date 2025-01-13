// app/(portal)/educational/actions/get-videos.ts

import { VideoType } from "@/types";

export async function getVideos(): Promise<VideoType[]> {
  const PANDA_API_KEY =
    "panda-8970b8a8bac987a420395ca53a99bd0da93cb1971aad2544549f1dee65c5376e";
  const PANDA_API_URL = process.env.PANDA_API_URL;

  try {
    const response = await fetch(`${PANDA_API_URL}/videos`, {
      headers: {
        Authorization: `Bearer ${PANDA_API_KEY}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Falha ao buscar vídeos");
    }

    return response.json();
  } catch (error) {
    console.error("Erro ao buscar vídeos:", error);
    throw error;
  }
}
