// app/(portal)/evaluations/_columns/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "../_components/status-badge";
import { formatDate } from "@/lib/utils";
import { PaymentButton } from "../_components/payment-button";

export type Evaluation = {
  id: string;
  renewalType?: "evaluation" | "paid_account";
  platform: string;
  plan: string;
  traderStatus: string;
  startDate: string | null;
  endDate: string | null;
  cancellationDate?: string | null;
  platformRenewal?: {
    platformStartDate: string | null;
    daysUntilExpiration: number | null;
    canRenew: boolean;
    isExpired: boolean;
    needsRenewal: boolean;
  };
};

export const columns: ColumnDef<Evaluation>[] = [
  {
    accessorKey: "platform",
    header: "Plataforma",
  },
  {
    accessorKey: "plan",
    header: "Plano",
  },
  {
    accessorKey: "traderStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("traderStatus") as string;
      return <StatusBadge status={status} />;
    },
  },
  {
    accessorKey: "startDate",
    header: "Início",
    cell: ({ row }) => {
      const startDate = row.original.startDate;
      return startDate ? formatDate(new Date(startDate)) : "-";
    },
  },
  {
    accessorKey: "endDate",
    header: "Fim",
    cell: ({ row }) => {
      const { traderStatus, cancellationDate } = row.original;

      // Exibir cancellationDate apenas quando status for "Finalizada"
      if (traderStatus === "Finalizada" && cancellationDate) {
        return formatDate(new Date(cancellationDate));
      }

      return "-";
    },
  },
  {
    id: "platformStartDate",
    header: "Data Plataforma",
    cell: ({ row }) => {
      const { traderStatus, platformRenewal } = row.original;

      // Só exibir para "Em Curso" ou "Ativo"
      if (traderStatus !== "Em Curso" && traderStatus !== "Ativo") return "-";

      const platformStartDate = platformRenewal?.platformStartDate;
      return platformStartDate ? formatDate(new Date(platformStartDate)) : "-";
    },
  },
  {
    id: "platformDaysLeft",
    header: "Dias a Vencer Plataforma",
    cell: ({ row }) => {
      const { traderStatus, platformRenewal } = row.original;

      // Só exibir para "Em Curso" ou "Ativo"
      if (traderStatus !== "Em Curso" && traderStatus !== "Ativo") return "-";

      const renewal = platformRenewal;
      if (!renewal || renewal.daysUntilExpiration === null) return "-";

      const days = renewal.daysUntilExpiration;
      let colorClass = "text-green-500";
      let text = `${days + 1} dias`;

      if (days < 0) {
        colorClass = "text-red-600 font-bold";
        text = `Vencido (${Math.abs(days)} dias)`;
      } else if (days === 0) {
        colorClass = "text-red-500 font-bold";
        text = "Vence hoje!";
      } else if (days <= 3) {
        colorClass = "text-orange-500 font-medium";
      } else if (days <= 7) {
        colorClass = "text-yellow-500";
      }

      return <span className={colorClass}>{text}</span>;
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const { platform, platformRenewal, renewalType } = row.original;

      // Só mostrar botão no dia do vencimento ou depois (daysUntilExpiration <= 0)
      if (
        !platformRenewal?.canRenew ||
        platformRenewal.daysUntilExpiration === null ||
        platformRenewal.daysUntilExpiration > 0
      ) {
        return null;
      }

      return (
        <PaymentButton
          platform={platform}
          evaluationId={row.original.id}
          renewalType={renewalType || "evaluation"}
        />
      );
    },
  },
];
