// app/(portal)/educational/cursos/_components/panda-video-player.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

interface PandaVideoPlayerProps {
  embedUrl: string;
  title?: string;
}

export function PandaVideoPlayer({ embedUrl, title }: PandaVideoPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Gerar um ID único para o container do player
  const containerId = useRef(
    `panda-player-${Math.random().toString(36).substring(2, 9)}`
  ).current;

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Função para processar e validar a URL do embed
    const processEmbedUrl = () => {
      // Se a URL já estiver completa com iframe src
      if (embedUrl.includes("src=")) {
        try {
          const srcMatch = embedUrl.match(/src="([^"]+)"/);
          if (srcMatch && srcMatch[1]) {
            return srcMatch[1];
          }
        } catch (e) {
          console.error("Erro ao extrair URL do embed:", e);
        }
      }

      // Se for apenas o ID do vídeo, construir URL completa
      if (embedUrl.match(/^[a-zA-Z0-9-]+$/)) {
        return `https://player-vz-7b362a62-4f9.tv.pandavideo.com.br/embed/?v=${embedUrl}`;
      }

      // Se for uma URL completa, usá-la diretamente
      return embedUrl;
    };

    // Verificar se a URL é válida para Panda Video
    const validateUrl = (url: string) => {
      return (
        url &&
        (url.includes("pandavideo.com") ||
          url.includes("panda-") ||
          url.includes("player-vz"))
      );
    };

    try {
      const processedUrl = processEmbedUrl();

      if (!validateUrl(processedUrl)) {
        setError("URL de vídeo inválida ou não suportada");
        setIsLoading(false);
        return;
      }

      // Função para lidar com a carga do iframe
      const handleIframeLoad = () => {
        setIsLoading(false);
      };

      // Função para lidar com erros do iframe
      const handleIframeError = () => {
        setError("Não foi possível carregar o vídeo");
        setIsLoading(false);
      };

      // Adicionar os event listeners
      const iframe = iframeRef.current;
      if (iframe) {
        iframe.addEventListener("load", handleIframeLoad);
        iframe.addEventListener("error", handleIframeError);

        // Atualizar a URL do iframe
        iframe.src = processedUrl;
      }

      // Limpar os event listeners ao desmontar ou quando a URL mudar
      return () => {
        if (iframe) {
          iframe.removeEventListener("load", handleIframeLoad);
          iframe.removeEventListener("error", handleIframeError);
        }
      };
    } catch (err) {
      console.error("Erro ao configurar player de vídeo:", err);
      setError("Erro ao configurar o player de vídeo");
      setIsLoading(false);
    }
  }, [embedUrl, containerId]);

  // Componente para exibir mensagem de erro
  const ErrorDisplay = ({ message }: { message: string }) => (
    <div className="aspect-video flex items-center justify-center bg-zinc-800 rounded-lg">
      <div className="text-center p-6">
        <div className="bg-red-500/20 text-red-300 p-3 rounded-lg inline-block mb-4">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-medium text-zinc-100 mb-2">
          Não foi possível carregar o vídeo
        </h3>
        <p className="text-zinc-400">{message}</p>
      </div>
    </div>
  );

  // Se houver um erro, mostrar mensagem
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  return (
    <div
      className="relative aspect-video bg-zinc-900 rounded-lg overflow-hidden"
      id={containerId}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      )}

      <iframe
        ref={iframeRef}
        className="absolute inset-0 w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        title={title || "Vídeo"}
      />
    </div>
  );
}
