// app/(portal)/educational/cursos/_components/panda-video-player.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface PandaVideoPlayerProps {
  embedUrl: string;
  title?: string;
}

export function PandaVideoPlayer({ embedUrl, title }: PandaVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Reset estados ao mudar de vídeo
    setIsLoading(true);
    setHasError(false);

    // Listener para monitorar carregamento do iframe
    const handleIframeLoad = () => {
      setIsLoading(false);
    };

    // Listener para monitorar erros do iframe
    const handleIframeError = () => {
      setIsLoading(false);
      setHasError(true);
    };

    // Timeout para evitar carregamento infinito
    const timeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setHasError(true);
      }
    }, 15000);

    // Buscar o iframe após renderização
    const iframe = containerRef.current?.querySelector("iframe");
    if (iframe) {
      iframe.addEventListener("load", handleIframeLoad);
      iframe.addEventListener("error", handleIframeError);
    }

    return () => {
      clearTimeout(timeout);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const iframe = containerRef.current?.querySelector("iframe");
      if (iframe) {
        iframe.removeEventListener("load", handleIframeLoad);
        iframe.removeEventListener("error", handleIframeError);
      }
    };
  }, [embedUrl, isLoading]);

  return (
    <div className="relative" ref={containerRef}>
      {/* Se estiver carregando, mostrar um loader */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-zinc-400">Carregando vídeo...</p>
          </div>
        </div>
      )}

      {/* Se houver erro, mostrar uma mensagem */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 z-10">
          <div className="text-center p-6">
            <p className="text-red-500 font-medium mb-2">
              Erro ao carregar o vídeo
            </p>
            <p className="text-zinc-400 mb-4">
              Não foi possível carregar o conteúdo. Verifique sua conexão e
              tente novamente.
            </p>
            <button
              onClick={() => {
                setIsLoading(true);
                setHasError(false);
                // Forçar o recarregamento do iframe
                const container = containerRef.current;
                if (container) {
                  const oldIframe = container.querySelector("iframe");
                  if (oldIframe) {
                    const newIframe = oldIframe.cloneNode(
                      true
                    ) as HTMLIFrameElement;
                    oldIframe.parentNode?.replaceChild(newIframe, oldIframe);
                  }
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Container do vídeo com proporção 16:9 */}
      <div className="aspect-video rounded-lg overflow-hidden">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || "Vídeo"}
        />
      </div>

      {/* Título do vídeo, se fornecido */}
      {title && (
        <div className="p-4">
          <h3 className="text-lg font-medium text-zinc-100">{title}</h3>
        </div>
      )}
    </div>
  );
}
