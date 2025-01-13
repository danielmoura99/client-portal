// app/(portal)/educational/components/video-grid.tsx
import { Card } from "@/components/ui/card";
import { PandaVideo } from "@/types/panda";

interface VideoGridProps {
  videos: PandaVideo[];
}

export function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {videos.map((video) => (
        <Card key={video.id} className="overflow-hidden max-w-sm">
          <div className="relative aspect-video">
            <div id={`panda-${video.id}`} className="w-full h-full" />
          </div>
          <div className="p-3">
            <h3 className="text-sm font-medium mb-1 truncate">{video.title}</h3>
            {video.description && (
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                {video.description}
              </p>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
