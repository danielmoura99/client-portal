// app/(portal)/educational/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getFolderVideos } from "./_actions/video-actions";
import { VideoPlayer } from "./_components/video-player";
import { VideoList } from "./_components/video-list";
import { PandaVideo } from "@/types/panda";

export default function EducationalPage() {
  const [videos, setVideos] = useState<PandaVideo[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");

  useEffect(() => {
    const loadVideos = async () => {
      const folderVideos = await getFolderVideos();
      setVideos(folderVideos);
      // Seleciona o primeiro vídeo por padrão
      if (folderVideos.length > 0) {
        setSelectedVideoId(folderVideos[0].id);
      }
    };
    loadVideos();
  }, []);

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Área Educacional</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Player - Ocupa 2/3 da largura em telas grandes */}
        <div className="lg:col-span-2">
          {selectedVideoId && (
            <VideoPlayer
              videoId={selectedVideoId}
              title={videos.find((v) => v.id === selectedVideoId)?.title}
            />
          )}
        </div>

        {/* Lista de Vídeos - Ocupa 1/3 da largura em telas grandes */}
        <div className="lg:col-span-1">
          <VideoList
            videos={videos}
            selectedVideoId={selectedVideoId}
            onVideoSelect={(videoId) => {
              setSelectedVideoId(videoId);
            }}
          />
        </div>
      </div>
    </div>
  );
}
