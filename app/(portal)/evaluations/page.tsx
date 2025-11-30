// app/(portal)/evaluations/page.tsx
import { fetchUserEvaluations } from "./_actions";
import EvaluationsTable from "./_components/evaluations-table";
import { Card, CardContent } from "@/components/ui/card";

export default async function EvaluationsPage() {
  const data = await fetchUserEvaluations();
  const evaluations = data?.evaluations || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-100">Minhas Avaliações</h1>
        <p className="text-zinc-400">
          Acompanhe o status e progresso das suas avaliações e contas
          remuneradas
        </p>
      </div>

      {/* Content */}
      {evaluations.length === 0 ? (
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-zinc-800 p-3 mb-4">
              <svg
                className="h-6 w-6 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-zinc-300">
              {data?.message || "Nenhuma avaliação encontrada"}
            </p>
            <p className="text-sm text-zinc-500 mt-2">
              Assim que você iniciar uma avaliação, ela aparecerá aqui.
            </p>
          </CardContent>
        </Card>
      ) : (
        <EvaluationsTable evaluations={evaluations} />
      )}
    </div>
  );
}
