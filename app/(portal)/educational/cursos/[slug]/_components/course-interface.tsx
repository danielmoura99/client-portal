// app/(portal)/educational/cursos/[slug]/_components/course-interface.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  Video,
  File,
  Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Content {
  id: string;
  title: string;
  type: string;
  path: string;
  description?: string | null;
  sortOrder: number;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  contents: Content[];
}

interface CourseInterfaceProps {
  courseId: string;
  courseName: string;
  courseSlug: string;
  modules: Module[];
  initialSelectedContent: Content | null;
}

export function CourseInterface({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseId,
  courseName,
  courseSlug,
  modules,
  initialSelectedContent,
}: CourseInterfaceProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [selectedContent, setSelectedContent] = useState<Content | null>(
    initialSelectedContent
  );
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(
    modules.reduce(
      (acc, module) => ({
        ...acc,
        [module.id]: false,
      }),
      {}
    )
  );
  const [isDownloading, setIsDownloading] = useState(false);

  // Se não tiver conteúdo selecionado inicialmente, selecionar o primeiro disponível
  useEffect(() => {
    if (!selectedContent && modules.length > 0) {
      for (const moduleItem of modules) {
        if (moduleItem.contents.length > 0) {
          setSelectedContent(moduleItem.contents[0]);
          break;
        }
      }
    }
  }, [modules, selectedContent]);

  // Se o módulo do conteúdo selecionado estiver fechado, abri-lo
  useEffect(() => {
    if (selectedContent) {
      // Encontrar o módulo do conteúdo selecionado
      for (const moduleItem of modules) {
        const contentInModule = moduleItem.contents.find(
          (c) => c.id === selectedContent.id
        );
        if (contentInModule) {
          setExpandedModules((prev) => ({
            ...prev,
            [moduleItem.id]: true,
          }));
          break;
        }
      }
    }
  }, [selectedContent, modules]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSelectContent = (content: Content) => {
    setSelectedContent(content);

    // Atualizar a URL sem recarregar a página usando replaceState
    window.history.replaceState(
      null,
      "",
      `/educational/cursos/${courseSlug}?content=${content.id}`
    );
  };

  const handleDownload = async (contentId: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch(`/api/contents/${contentId}`);

      if (!response.ok) {
        throw new Error("Erro ao baixar arquivo");
      }

      // Verificamos o tipo de resposta
      const contentType = response.headers.get("content-type");

      // Se for um redirecionamento (para Vercel Blob)
      if (response.redirected) {
        // Abrimos a URL do Vercel Blob em uma nova aba
        window.open(response.url, "_blank");

        toast({
          title: "Download iniciado",
          description: "O arquivo está sendo baixado diretamente do servidor.",
        });
      }
      // Se for um arquivo no formato blob (arquivos menores ou outros servidores)
      else if (contentType && !contentType.includes("application/json")) {
        const blob = await response.blob();
        const filename = selectedContent?.path.split("/").pop() || "download";

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
      }
      // Se for um JSON com URL (outra forma de servir arquivos do Vercel Blob)
      else {
        const data = await response.json();

        if (data.url) {
          window.open(data.url, "_blank");

          toast({
            title: "Download iniciado",
            description:
              "O arquivo está sendo baixado diretamente do servidor.",
          });
        } else {
          throw new Error("Formato de resposta não reconhecido");
        }
      }
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

  const renderContentViewer = () => {
    if (!selectedContent) {
      return (
        <div className="flex items-center justify-center h-[400px]">
          <div className="text-center p-6">
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">
              Bem-vindo ao curso: {courseName}
            </h3>
            <p className="text-zinc-400 mb-6">
              Selecione um conteúdo no menu ao lado para começar a aprender.
            </p>
          </div>
        </div>
      );
    }

    switch (selectedContent.type) {
      case "video":
        return (
          <div className="aspect-video rounded-lg overflow-hidden">
            <iframe
              src={selectedContent.path}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={selectedContent.title}
            />
          </div>
        );

      case "file":
        return (
          <div className="flex flex-col items-center justify-center p-8">
            <FileText className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-lg font-medium text-zinc-100 mb-2">
              {selectedContent.title}
            </h3>
            {selectedContent.description && (
              <p className="text-zinc-400 text-center mb-6 max-w-md">
                {selectedContent.description}
              </p>
            )}
            <Button
              onClick={() => handleDownload(selectedContent.id)}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Arquivo
                </>
              )}
            </Button>
          </div>
        );

      case "article":
        return (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">{selectedContent.title}</h2>
            <div className="prose prose-invert max-w-none">
              {selectedContent.description && (
                <p>{selectedContent.description}</p>
              )}
              {/* Aqui seria renderizado o conteúdo do artigo em HTML ou Markdown */}
              <p>Conteúdo do artigo seria renderizado aqui.</p>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-zinc-400">
              Tipo de conteúdo não suportado para visualização direta.
            </p>
          </div>
        );
    }
  };

  // Helper para ícones de tipo de conteúdo
  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "file":
        return <File className="h-4 w-4 text-green-500" />;
      case "article":
        return <FileText className="h-4 w-4 text-yellow-500" />;
      default:
        return <File className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Lista de módulos e conteúdos */}
      <div className="md:col-span-1">
        <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg sticky top-4">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              Conteúdo do Curso
            </h2>

            <div className="space-y-3">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="border-b border-zinc-800 pb-3 last:pb-0 last:border-0"
                >
                  <button
                    className="flex w-full items-center justify-between text-left font-medium text-zinc-100 hover:text-zinc-50 transition-colors py-2"
                    onClick={() => toggleModule(module.id)}
                  >
                    <span>{module.title}</span>
                    {expandedModules[module.id] ? (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-zinc-400" />
                    )}
                  </button>

                  {expandedModules[module.id] && (
                    <div className="mt-2 pl-3 space-y-1">
                      {module.contents.length > 0 ? (
                        module.contents.map((content) => (
                          <button
                            key={content.id}
                            className={`w-full text-left px-3 py-2 rounded-md flex items-center ${
                              selectedContent?.id === content.id
                                ? "bg-blue-500/20 text-zinc-100"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50"
                            }`}
                            onClick={() => handleSelectContent(content)}
                          >
                            {getContentIcon(content.type)}
                            <span className="ml-2 text-sm truncate">
                              {content.title}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-xs text-zinc-500 pl-2 py-1">
                          Nenhum conteúdo disponível neste módulo
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Área de visualização de conteúdo */}
      <div className="md:col-span-2">
        <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <CardContent className="p-0">{renderContentViewer()}</CardContent>
        </Card>
      </div>
    </div>
  );
}
