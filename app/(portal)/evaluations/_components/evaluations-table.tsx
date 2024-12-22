// app/(portal)/evaluations/_components/evaluations-table.tsx
"use client";

import { DataTable } from "@/components/ui/data-table";
import { columns, type Evaluation } from "../_columns/columns";

interface EvaluationsTableProps {
  evaluations: Evaluation[];
}

// Note o "export default" aqui
export default function EvaluationsTable({
  evaluations,
}: EvaluationsTableProps) {
  return (
    <div className="rounded-md border border-zinc-800 bg-zinc-900/50">
      <DataTable columns={columns} data={evaluations} searchColumn="platform" />
    </div>
  );
}
