// app/(portal)/educational/_components/content-viewer.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContentViewerProps {
  content: {
    id: string;
    title: string;
    type: string;
    path: string;
    description?: string | null;
    productContentId?: string;
    moduleId?: string | null;
    sortOrder?: number;
  };
}

export function ContentViewer({ content }: ContentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      const response = await fetch(`/api/contents/${content.id}`);

      if (!response.ok) {
        throw new Error("Erro ao baixar arquivo");
      }

      const blob = await response.blob();
      const filename = content.path.split("/").pop() || "download";

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Download concluído",
        description: `O arquivo ${filename} foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  useEffect(() => {
    // Simulação de carregamento
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, [content.id]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      );
    }

    // Renderizar com base no tipo de conteúdo
    switch (content.type) {
      case "video":
        return (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={content.path}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={content.title}
            />
          </div>
        );

      case "file":
        return (
          <div className="flex flex-col items-center justify-center py-12 px-4 bg-zinc-800/50 rounded-lg">
            <FileText className="h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-zinc-100 mb-2">
              {content.title}
            </h3>
            {content.description && (
              <p className="text-zinc-400 text-center mb-6 max-w-md">
                {content.description}
              </p>
            )}
            <Button onClick={handleDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Arquivo
                </>
              )}
            </Button>
          </div>
        );

      case "article":
        return (
          <div className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-a:text-blue-400">
            {/* Aqui você poderia renderizar conteúdo markdown ou HTML */}
            <h2>{content.title}</h2>
            <p>{content.description}</p>
            {/* Conteúdo do artigo seria carregado e renderizado aqui */}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-96 bg-zinc-800/50 rounded-lg">
            <p className="text-zinc-400">
              Este tipo de conteúdo não pode ser visualizado diretamente.
            </p>
          </div>
        );
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
      <CardContent className="p-0">{renderContent()}</CardContent>
    </Card>
  );
}
