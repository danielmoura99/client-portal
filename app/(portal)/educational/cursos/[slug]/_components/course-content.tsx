// app/(portal)/educational/cursos/[slug]/_components/course-content.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { PandaVideoPlayer } from "../../_components/panda-video-player";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  ChevronDown,
  ChevronRight,
  Video,
  File,
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

interface CourseContentProps {
  courseId: string;
  courseName: string;
  courseSlug: string;
  modules: Module[];
}

export function CourseContent({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseId,
  courseName,
  courseSlug,
  modules,
}: CourseContentProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(modules.reduce((acc, module) => ({ ...acc, [module.id]: true }), {}));

  // Selecionar o primeiro conteúdo disponível quando o componente é montado
  useEffect(() => {
    if (modules.length > 0) {
      for (const moduleItem of modules) {
        if (moduleItem.contents.length > 0) {
          setSelectedContent(moduleItem.contents[0]);
          break;
        }
      }
    }
  }, [modules]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleSelectContent = (content: Content) => {
    setSelectedContent(content);

    // Atualizar a URL sem recarregar a página usando replaceState
    // Isso mantém a navegação limpa e permite compartilhar links diretos para conteúdos
    window.history.replaceState(
      null,
      "",
      `/educational/cursos/${courseSlug}?content=${content.id}`
    );
  };

  const handleDownload = async (contentId: string) => {
    try {
      const response = await fetch(`/api/contents/${contentId}`);
      if (!response.ok) throw new Error("Erro ao baixar arquivo");

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
        description: `O arquivo foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao baixar arquivo:", error);
      toast({
        title: "Erro ao baixar",
        description: "Não foi possível baixar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Lista de módulos e conteúdos */}
      <div className="md:col-span-1">
        <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg">
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

                  {module.description && (
                    <p className="text-sm text-zinc-400 mb-2">
                      {module.description}
                    </p>
                  )}

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
                            {content.type === "video" ? (
                              <Video className="h-4 w-4 mr-2 text-blue-500" />
                            ) : (
                              <File className="h-4 w-4 mr-2 text-green-500" />
                            )}
                            <span className="text-sm truncate">
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
          <CardContent className="p-0">
            {selectedContent ? (
              <>
                {selectedContent.type === "video" ? (
                  <PandaVideoPlayer
                    embedUrl={selectedContent.path}
                    title={selectedContent.title}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8">
                    <FileText className="h-16 w-16 text-green-500 mb-4" />
                    <h3 className="text-lg font-medium text-zinc-100 mb-2">
                      {selectedContent.title}
                    </h3>
                    {selectedContent.description && (
                      <p className="text-zinc-400 text-center mb-6">
                        {selectedContent.description}
                      </p>
                    )}
                    <Button onClick={() => handleDownload(selectedContent.id)}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Arquivo
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <div className="text-center p-6">
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                    Bem-vindo ao curso: {courseName}
                  </h3>
                  <p className="text-zinc-400 mb-6">
                    Selecione um conteúdo no menu ao lado para começar a
                    aprender.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
