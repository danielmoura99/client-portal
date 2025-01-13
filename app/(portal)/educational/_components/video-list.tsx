// app/(portal)/educational/_components/video-list.tsx
import { Card } from "@/components/ui/card";
import { PandaVideo } from "@/types/panda";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface VideoListProps {
  videos: PandaVideo[];
  selectedVideoId?: string;
  onVideoSelect: (videoId: string) => void;
}

export function VideoList({
  videos,
  selectedVideoId,
  onVideoSelect,
}: VideoListProps) {
  return (
    <Card className="h-[600px]">
      <ScrollArea className="h-full">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            Vídeos da Traders House
          </h3>
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className={cn(
                  "flex items-start space-x-3 p-2 rounded-lg cursor-pointer transition-colors",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  selectedVideoId === video.id && "bg-zinc-100 dark:bg-zinc-800"
                )}
                onClick={() => onVideoSelect(video.id)}
              >
                <div className="relative w-32 aspect-video bg-zinc-200 dark:bg-zinc-700 rounded">
                  {video.thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="rounded object-cover w-full h-full"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {video.title}
                  </h4>
                  {video.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 mt-1">
                      {video.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}
