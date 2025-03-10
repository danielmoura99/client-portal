// app/(portal)/educational/_components/download-card.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Download } from "lucide-react";
import { useState } from "react";

interface DownloadCardProps {
  title: string;
  description: string;
  filename: string;
  fileType: "excel" | "pdf" | "doc";
}

export function DownloadCard({
  title,
  description,
  filename,
  fileType,
}: DownloadCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Mapeamento de ícones por tipo de arquivo
  const fileIcons = {
    excel: <FileSpreadsheet className="h-14 w-14 text-green-500" />,
    pdf: <FileSpreadsheet className="h-14 w-14 text-red-500" />,
    doc: <FileSpreadsheet className="h-14 w-14 text-blue-500" />,
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Aqui faríamos a requisição para o servidor para obter o arquivo
      // Por enquanto, vamos simular um download após um pequeno delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Criar um link para download do arquivo estático na pasta public
      const link = document.createElement("a");
      link.href = `/${filename}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">{fileIcons[fileType]}</div>
          <div className="flex-1 space-y-3">
            <h3 className="font-medium text-zinc-100">{title}</h3>
            <p className="text-sm text-zinc-400">{description}</p>
            <Button
              onClick={handleDownload}
              className="w-full"
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>Baixando...</>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar Arquivo
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
