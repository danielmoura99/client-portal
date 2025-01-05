// app/(portal)/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import StatusCard from "./_components/status-card";
import ActionButtons from "./_components/action-buttons";
import SupportChannels from "./_components/support-channels";
import KnowledgeBase from "./_components/knowledge-base";

interface Evaluation {
  id: string;
  type: "B3" | "FX";
  plan: string;
  traderStatus: string;
  startDate?: Date;
  endDate?: Date;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);

  useEffect(() => {
    console.log("Dashboard - Session Status:", status);
    console.log("Dashboard - Session:", !!session);

    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router]);

  useEffect(() => {
    async function loadEvaluations() {
      if (session?.user) {
        try {
          const response = await fetch("/api/evaluations/user");
          if (!response.ok) {
            throw new Error("Erro ao carregar avaliações");
          }
          const data = await response.json();
          setEvaluations(data.evaluations || []);
        } catch (error) {
          console.error("Erro ao carregar avaliações:", error);
        }
      }
    }

    if (session?.user) {
      loadEvaluations();
    }
  }, [session]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-zinc-100">
          Bem-vindo(a), {session.user?.name}
        </h2>
        <p className="text-zinc-400">
          Aqui você pode acompanhar suas avaliações e fazer solicitações.
        </p>
      </div>

      {/* Status das Avaliações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evaluations.map((evaluation) => (
          <StatusCard key={evaluation.id} evaluation={evaluation} />
        ))}
      </div>

      {/* Ações Rápidas */}
      <ActionButtons />

      {/* Suporte e Base de Conhecimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SupportChannels />
        <KnowledgeBase />
      </div>
    </div>
  );
}
