// app/(portal)/evaluations/page.tsx
import { fetchUserEvaluations } from "./_actions";
import EvaluationsTable from "./_components/evaluations-table";

export default async function EvaluationsPage() {
  const data = await fetchUserEvaluations();
  const evaluations = data?.evaluations || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-100">Minhas Avaliações</h1>
        <p className="text-zinc-400">
          Acompanhe o status e progresso das suas avaliações
        </p>
      </div>

      {evaluations.length === 0 ? (
        <div className="flex items-center justify-center h-[200px] bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <p className="text-zinc-400">Nenhuma avaliação encontrada</p>
        </div>
      ) : (
        <EvaluationsTable evaluations={evaluations} />
      )}
    </div>
  );
}
