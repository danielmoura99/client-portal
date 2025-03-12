// app/(portal)/educational/cursos/[slug]/_components/module-list.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Content {
  id: string;
  title: string;
  type: string;
  description?: string | null;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  contents: Content[];
}

interface ModuleListProps {
  modules: Module[];
}

export function ModuleList({ modules }: ModuleListProps) {
  const [expandedModules, setExpandedModules] = useState<
    Record<string, boolean>
  >(modules.reduce((acc, module) => ({ ...acc, [module.id]: true }), {}));

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  // Helper para ícones de tipo de conteúdo
  const getContentIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-blue-500" />;
      case "file":
        return <FileText className="h-4 w-4 text-green-500" />;
      default:
        return <FileText className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
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
            <p className="text-sm text-zinc-400 mb-2">{module.description}</p>
          )}

          {expandedModules[module.id] && (
            <div className="mt-2 pl-3 space-y-1">
              {module.contents.length > 0 ? (
                module.contents.map((content) => (
                  <Link
                    key={content.id}
                    href={`/educational/cursos/conteudo/${content.id}`}
                    className="block"
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 pl-2 h-auto py-2"
                    >
                      {getContentIcon(content.type)}
                      <span className="ml-2 text-sm">{content.title}</span>
                      <ArrowRight className="h-3 w-3 ml-auto text-zinc-500" />
                    </Button>
                  </Link>
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
  );
}
