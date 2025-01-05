// app/(portal)/dashboard/_components/action-buttons.tsx
import Link from "next/link";
import { MessageSquare, PlusCircle } from "lucide-react";

export default function ActionButtons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <>
        <a
          href="https://tradershouse.com.br/mesaproprietaria/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-lg p-4 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          Iniciar Nova Avaliação
        </a>

        <Link
          href="/requests"
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg p-4 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          Abrir Solicitação
        </Link>
      </>
    </div>
  );
}
