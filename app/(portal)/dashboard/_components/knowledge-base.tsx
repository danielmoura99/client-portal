/// app/(portal)/dashboard/_components/knowledge-base.tsx
import Link from "next/link";
import { BookOpen, HelpCircle, Video } from "lucide-react";

export default function KnowledgeBase() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
      <h3 className="text-lg font-medium text-zinc-100 mb-4">
        Base de Conhecimento
      </h3>

      <div className="space-y-3">
        <Link
          href="https://escolatradershouse.com.br/regulamento-mesa/"
          className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          Regulamento
        </Link>

        <Link
          href=""
          className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          Perguntas Frequentes
        </Link>

        <Link
          href=""
          className="flex items-center gap-3 text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <Video className="w-5 h-5" />
          Tutoriais
        </Link>
      </div>
    </div>
  );
}
