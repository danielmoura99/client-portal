// app/(portal)/educational/_components/video-player.tsx
import { Card } from "@/components/ui/card";

interface VideoPlayerProps {
  videoId: string;
  title?: string;
}

export function VideoPlayer({ videoId, title }: VideoPlayerProps) {
  return (
    <Card className="overflow-hidden max-w-4xl mx-auto">
      <div className="relative aspect-video">
        <iframe
          id={`panda-${videoId}`}
          src={`https://player-vz-7b362a62-4f9.tv.pandavideo.com.br/embed/?v=${videoId}`}
          className="absolute inset-0 w-full h-full"
          style={{ border: "none" }}
          allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture"
          allowFullScreen
          //fetchpriority="high"
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
