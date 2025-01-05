// app/(portal)/dashboard/_components/status-card.tsx

import { formatDate } from "@/lib/utils";

interface StatusCardProps {
  evaluation: {
    id: string;
    type: "B3" | "FX";
    plan: string;
    traderStatus: string;
    startDate?: Date;
    endDate?: Date;
  };
}

function getStatusColor(status: string) {
  switch (status) {
    case "Aguardando Inicio":
      return "text-yellow-500";
    case "Em Curso":
      return "text-blue-500";
    case "Aprovado":
      return "text-green-500";
    case "Reprovado":
      return "text-red-500";
    default:
      return "text-zinc-400";
  }
}

export default function StatusCard({ evaluation }: StatusCardProps) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-zinc-100">{evaluation.plan}</h3>
          <p className="text-sm text-zinc-400">{evaluation.type}</p>
        </div>
        <span className={getStatusColor(evaluation.traderStatus)}>
          {evaluation.traderStatus}
        </span>
      </div>

      {evaluation.startDate && (
        <div className="text-sm">
          <p className="text-zinc-400">
            Início: {formatDate(new Date(evaluation.startDate))}
          </p>
          {evaluation.endDate && (
            <p className="text-zinc-400">
              Fim: {formatDate(new Date(evaluation.endDate))}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
