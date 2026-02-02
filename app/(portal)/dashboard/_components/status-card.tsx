// app/(portal)/dashboard/_components/status-card.tsx

import { formatDate } from "@/lib/utils";
import { PaymentButton } from "../../evaluations/_components/payment-button";

interface StatusCardProps {
  evaluation: {
    id: string;
    renewalType: "evaluation" | "paid_account";
    platform: string | null;
    plan: string | null;
    traderStatus: string | null;
    startDate: Date | null;
    endDate: Date | null;
    cancellationDate?: Date | null;
    platformRenewal: {
      platformStartDate: Date | null;
      daysUntilExpiration: number | null;
      canRenew: boolean;
      isExpired: boolean;
      needsRenewal: boolean;
    };
  };
}

function getStatusColor(status: string | null) {
  if (!status) return "text-zinc-400";

  switch (status) {
    case "Aguardando Inicio":
      return "text-yellow-500";
    case "Em Curso":
      return "text-blue-500";
    case "Aprovado":
    case "Ativo":
      return "text-green-500";
    case "Reprovado":
      return "text-red-500";
    default:
      return "text-zinc-400";
  }
}

function getDaysColor(days: number | null) {
  if (days === null) return "text-zinc-400";
  if (days < 0) return "text-red-600 font-bold"; // Vencido
  if (days === 0) return "text-red-500 font-bold"; // Dia do vencimento
  if (days <= 3) return "text-orange-500 font-medium"; // Alerta (3 dias ou menos)
  if (days <= 7) return "text-yellow-500"; // Atenção
  return "text-green-500"; // Normal
}

export default function StatusCard({ evaluation }: StatusCardProps) {
  const { traderStatus, platformRenewal, platform, plan } = evaluation;
  const showPlatformInfo =
    traderStatus === "Em Curso" || traderStatus === "Ativo";

  // Verificar se platformRenewal existe
  if (!platformRenewal) {
    console.warn(
      "platformRenewal não encontrado para avaliação:",
      evaluation.id
    );
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-zinc-100">{plan || "N/A"}</h3>
          <p className="text-sm text-zinc-400">{platform || "N/A"}</p>
        </div>
        <span className={getStatusColor(traderStatus)}>
          {traderStatus || "N/A"}
        </span>
      </div>

      {/* Informações de Data da Avaliação */}
      {evaluation.startDate && (
        <div className="text-sm space-y-1">
          <p className="text-zinc-400">
            <span className="font-medium">Início Avaliação:</span>{" "}
            {formatDate(new Date(evaluation.startDate))}
          </p>
          {traderStatus === "Finalizada" && evaluation.cancellationDate && (
            <p className="text-zinc-400">
              <span className="font-medium">Fim Avaliação:</span>{" "}
              {formatDate(new Date(evaluation.cancellationDate))}
            </p>
          )}
        </div>
      )}

      {/* Informações de Renovação de Plataforma */}
      {showPlatformInfo &&
        platformRenewal &&
        platformRenewal.platformStartDate && (
          <div className="border-t border-zinc-800 pt-3 space-y-2">
            <p className="text-sm text-zinc-400">
              <span className="font-medium">Plataforma Ativa desde:</span>{" "}
              {formatDate(new Date(platformRenewal.platformStartDate))}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-sm">
                <span className="text-zinc-400 font-medium">
                  Dias restantes:
                </span>{" "}
                <span
                  className={getDaysColor(platformRenewal.daysUntilExpiration)}
                >
                  {platformRenewal.daysUntilExpiration !== null
                    ? platformRenewal.daysUntilExpiration < 0
                      ? `Vencida há ${Math.abs(platformRenewal.daysUntilExpiration)} dias`
                      : platformRenewal.daysUntilExpiration === 0
                        ? "Vence hoje!"
                        : `${platformRenewal.daysUntilExpiration + 1} dias`
                    : "N/A"}
                </span>
              </p>
            </div>

            {/* Botão de Pagamento (se elegível) */}
            {platformRenewal.canRenew &&
              platformRenewal.daysUntilExpiration !== null &&
              platformRenewal.daysUntilExpiration <= 0 &&
              platform && (
                <div className="pt-2">
                  <PaymentButton
                    platform={platform}
                    evaluationId={evaluation.id}
                    renewalType={evaluation.renewalType}
                  />
                </div>
              )}
          </div>
        )}
    </div>
  );
}
