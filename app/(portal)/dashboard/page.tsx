// app/(portal)/dashboard/page.tsx
import { fetchActiveEvaluations } from "./_actions";
import StatusCard from "./_components/status-card";
import ActionButtons from "./_components/action-buttons";
import SupportChannels from "./_components/support-channels";
import KnowledgeBase from "./_components/knowledge-base";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const data = await fetchActiveEvaluations();
  const evaluations = data?.evaluations || [];

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-zinc-100">
          Bem-vindo(a), {session.user?.name}
        </h2>
        <p className="text-zinc-400">
          Aqui você pode acompanhar suas avaliações ativas e fazer solicitações.
        </p>
      </div>

      {/* Status das Avaliações */}
      {evaluations.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8 text-center">
          <p className="text-zinc-400">
            {data?.message || "Você não possui avaliações ativas no momento."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((evaluation) => (
            <StatusCard key={evaluation.id} evaluation={evaluation} />
          ))}
        </div>
      )}

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
