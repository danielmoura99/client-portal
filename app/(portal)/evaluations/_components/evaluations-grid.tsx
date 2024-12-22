// app/(portal)/evaluations/_components/evaluations-grid.tsx
import { EvaluationCard } from "./evaluations-card";

interface Evaluation {
  status: string;
  startDate: string | null;
  endDate: string | null;
  platform: string;
  plan: string;
}

interface EvaluationsGridProps {
  evaluations: Evaluation[];
}

export function EvaluationsGrid({ evaluations }: EvaluationsGridProps) {
  if (!evaluations || evaluations.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <p className="text-zinc-400">Nenhuma avaliação encontrada</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {evaluations.map((evaluation, index) => (
        <EvaluationCard key={index} evaluation={evaluation} />
      ))}
    </div>
  );
}
