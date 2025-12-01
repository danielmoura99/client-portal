// app/(portal)/dashboard/_actions/index.ts
"use server";

import { getClientEvaluations } from "@/lib/services/evaluations";
import { getServerSession } from "next-auth";

export async function fetchActiveEvaluations() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      throw new Error("Usuário não autenticado");
    }

    const result = await getClientEvaluations({ user: session.user });

    if (!result || !result.evaluations) {
      return {
        evaluations: [],
        message: "Nenhuma avaliação encontrada",
      };
    }

    // Filtrar apenas "Ativo" e "Em Curso"
    const activeEvaluations = result.evaluations.filter(
      (evaluation) =>
        evaluation.traderStatus === "Ativo" ||
        evaluation.traderStatus === "Em Curso"
    );

    return {
      evaluations: activeEvaluations,
      message:
        activeEvaluations.length > 0
          ? "Avaliações ativas carregadas"
          : "Nenhuma avaliação ativa no momento",
    };
  } catch (error) {
    console.error("Erro ao buscar avaliações ativas:", error);
    throw new Error("Falha ao carregar avaliações ativas");
  }
}
