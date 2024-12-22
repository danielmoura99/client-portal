// app/(portal)/evaluations/_components/evaluation-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { formatDate } from "@/lib/utils";

interface EvaluationCardProps {
  evaluation: {
    status: string;
    startDate: string | null;
    endDate: string | null;
    platform: string;
    plan: string;
  };
}

export function EvaluationCard({ evaluation }: EvaluationCardProps) {
  const { status, startDate, endDate, platform, plan } = evaluation;

  function getRemainingDays() {
    if (!startDate || !endDate) return null;
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }

  const remainingDays = getRemainingDays();

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-zinc-100">
          Avaliação {platform}
        </CardTitle>
        <StatusBadge status={status} />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mt-2">
          <div>
            <p className="text-sm text-zinc-400">Plano</p>
            <p className="text-zinc-100">{plan}</p>
          </div>

          {startDate && (
            <div>
              <p className="text-sm text-zinc-400">Início</p>
              <p className="text-zinc-100">{formatDate(new Date(startDate))}</p>
            </div>
          )}

          {endDate && (
            <div>
              <p className="text-sm text-zinc-400">Fim</p>
              <p className="text-zinc-100">{formatDate(new Date(endDate))}</p>
            </div>
          )}

          {remainingDays !== null && status === "Em Curso" && (
            <div>
              <p className="text-sm text-zinc-400">Dias Restantes</p>
              <p className="text-zinc-100">{remainingDays} dias</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
