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
    <div className="flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Área Educacional</h2>
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
