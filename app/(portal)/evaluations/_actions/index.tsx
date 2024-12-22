// app/(portal)/evaluations/_actions/index.ts
"use server";

import { getClientEvaluations } from "@/lib/services/evaluations";
import { getServerSession } from "next-auth";

export async function fetchUserEvaluations() {
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

    return {
      evaluations: result.evaluations,
      message: "Avaliações carregadas com sucesso",
    };
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    throw new Error("Falha ao carregar avaliações");
  }
}
