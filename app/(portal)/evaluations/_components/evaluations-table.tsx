// app/(portal)/evaluations/_components/evaluations-table.tsx
"use client";

import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { columns, type Evaluation } from "../_columns/columns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, TrendingUp } from "lucide-react";

interface EvaluationsTableProps {
  evaluations: Evaluation[];
}

export default function EvaluationsTable({
  evaluations,
}: EvaluationsTableProps) {
  const [showAll, setShowAll] = useState(false);

  // Filtrar apenas "Ativo", "Em Curso" e "Aguardando Pagamento" por padrão
  const filteredEvaluations = showAll
    ? evaluations
    : evaluations.filter(
        (evaluation) =>
          evaluation.traderStatus === "Ativo" ||
          evaluation.traderStatus === "Em Curso" ||
          evaluation.traderStatus === "Aguardando Pagamento"
      );

  const activeCount = evaluations.filter(
    (e) =>
      e.traderStatus === "Ativo" ||
      e.traderStatus === "Em Curso" ||
      e.traderStatus === "Aguardando Pagamento"
  ).length;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Avaliações Ativas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">{activeCount}</div>
            <p className="text-xs text-zinc-500 mt-1">
              Contas em avaliação ou ativas
            </p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-400">
              Total de Avaliações
            </CardTitle>
            <History className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-100">
              {evaluations.length}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Incluindo histórico completo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="border-zinc-800 bg-zinc-900/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-zinc-100">
                {showAll ? "Histórico Completo" : "Avaliações Ativas"}
              </CardTitle>
              <CardDescription className="text-zinc-400 mt-1">
                {showAll
                  ? `Exibindo todas as ${evaluations.length} avaliações`
                  : `${filteredEvaluations.length} avaliação(ões) ativa(s)`}
              </CardDescription>
            </div>
            <Button
              variant={showAll ? "default" : "outline"}
              onClick={() => setShowAll(!showAll)}
              className="gap-2"
            >
              <History className="h-4 w-4" />
              {showAll ? "Apenas Ativas" : "Histórico Completo"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={filteredEvaluations}
            searchColumn="platform"
          />
        </CardContent>
      </Card>
    </div>
  );
}
