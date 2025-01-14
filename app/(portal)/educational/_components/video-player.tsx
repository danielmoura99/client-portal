// app/(portal)/educational/_components/video-player.tsx
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  videoId: string;
  embedId?: string | null;
  playerUrl?: string | null;
  title?: string;
}

export function VideoPlayer({
  videoId,
  embedId,
  playerUrl,
  title,
}: VideoPlayerProps) {
  console.log("VideoPlayer props:", { videoId, embedId, playerUrl, title });

  if (!embedId) {
    return (
      <Card className="overflow-hidden max-w-4xl mx-auto">
        <div className="relative aspect-video flex items-center justify-center bg-zinc-100 dark:bg-zinc-800">
          <p>Carregando vídeo...</p>
        </div>
      </Card>
    );
  }

  // Se temos a URL completa do player, usamos ela, senão construímos
  const embedUrl =
    playerUrl ||
    `https://player-vz-7b362a62-4f9.tv.pandavideo.com.br/embed/?v=${embedId}`;

  return (
    <Card className="overflow-hidden max-w-4xl mx-auto">
      <div className="relative aspect-video">
        <iframe
          id={`panda-${videoId}`}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
          allowFullScreen
        />
      </div>
      {title && (
        <div className="p-4">
          <h3 className="text-lg font-medium">{title}</h3>
        </div>
      )}
    </Card>
  );
}
