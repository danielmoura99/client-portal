// app/(portal)/evaluations/_columns/columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { StatusBadge } from "../_components/status-badge";
import { formatDate } from "@/lib/utils";

export type Evaluation = {
  id: string;
  platform: string;
  plan: string;
  traderStatus: string;
  startDate: string | null;
  endDate: string | null;
};

function calculateRemainingDays(
  startDate: string | null,
  endDate: string | null
): number | null {
  if (!startDate || !endDate) return null;
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

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
      const endDate = row.original.endDate;
      return endDate ? formatDate(new Date(endDate)) : "-";
    },
  },
  {
    id: "remainingDays",
    header: "Dias Restantes",
    cell: ({ row }) => {
      const { startDate, endDate, traderStatus } = row.original;
      if (traderStatus !== "Em Curso") return "-";

      const remaining = calculateRemainingDays(startDate, endDate);
      return remaining !== null ? `${remaining} dias` : "-";
    },
  },
];
