// app/(portal)/educational/_components/tool-card.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileArchive, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface ToolCardProps {
  title: string;
  description: string;
  contents: {
    id: string;
    title: string;
    type: string;
    path: string;
  }[];
}

export function ToolCard({ title, description, contents }: ToolCardProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Helper para ícones de tipo de arquivo
  const getFileIcon = (path: string) => {
    if (path.endsWith(".xlsx") || path.endsWith(".xls")) {
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    } else if (path.endsWith(".pdf")) {
      return <FileArchive className="h-5 w-5 text-red-500" />;
    } else {
      return <FileSpreadsheet className="h-5 w-5 text-zinc-400" />;
    }
  };

  const handleDownload = async (contentId: string) => {
    try {
      setDownloadingId(contentId);

      // Requisição para nosso endpoint de API
      const response = await fetch(`/api/contents/${contentId}`);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Erro ao baixar arquivo");
      }

      // Obter o blob do arquivo
      const blob = await response.blob();

      // Encontrar o conteúdo para obter o nome do arquivo
      const content = contents.find((c) => c.id === contentId);
      const filename = content?.path.split("/").pop() || "download";

      // Criar URL de objeto e trigger do download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Limpar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      toast({
        title: "Download concluído",
        description: "O arquivo foi baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast({
        title: "Erro ao baixar",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <div className="flex-shrink-0 mb-4">
          <FileSpreadsheet className="h-14 w-14 text-blue-500" />
        </div>

        <div className="flex-1 space-y-3">
          <h3 className="font-medium text-zinc-100">{title}</h3>
          <p className="text-sm text-zinc-400">{description}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-800">
          <h4 className="text-sm font-medium text-zinc-300 mb-2">
            Arquivos disponíveis:
          </h4>

          <div className="space-y-2">
            {contents.map((content) => (
              <Button
                key={content.id}
                variant="outline"
                className="w-full justify-start text-zinc-300 border-zinc-700 hover:bg-zinc-800"
                onClick={() => handleDownload(content.id)}
                disabled={downloadingId === content.id}
              >
                {downloadingId === content.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  getFileIcon(content.path)
                )}
                <span className="ml-2 text-sm truncate">{content.title}</span>

                {downloadingId !== content.id && (
                  <Download className="ml-auto h-4 w-4 text-zinc-400" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
