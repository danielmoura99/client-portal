// app/(portal)/educational/page.tsx
"use client";

import { useEffect, useState } from "react";
import { getFolderVideos } from "./_actions/video-actions";
import { VideoPlayer } from "./_components/video-player";
import { VideoList } from "./_components/video-list";
import { PandaVideo } from "@/types/panda";

export default function EducationalPage() {
  const [videos, setVideos] = useState<
    (PandaVideo & { embed_id?: string | null })[]
  >([]);
  const [selectedVideoId, setSelectedVideoId] = useState<string>("");

  useEffect(() => {
    const loadVideos = async () => {
      const folderVideos = await getFolderVideos();
      setVideos(folderVideos);
      if (folderVideos.length > 0) {
        setSelectedVideoId(folderVideos[0].id);
      }
    };
    loadVideos();
  }, []);

  const selectedVideo = videos.find((v) => v.id === selectedVideoId);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-100">Tutoriais</h1>
        <p className="text-zinc-400">
          Aqui você tem acesso a vídeos informativos, explicando o funcionamento
          da mesa propietária.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {selectedVideo && (
            <VideoPlayer
              videoId={selectedVideo.id}
              embedId={selectedVideo.embed_id}
              title={selectedVideo.title}
            />
          )}
        </div>

        <div className="lg:col-span-1">
          <VideoList
            videos={videos}
            selectedVideoId={selectedVideoId}
            onVideoSelect={(videoId) => setSelectedVideoId(videoId)}
          />
        </div>
      </div>
    </div>
  );
}
