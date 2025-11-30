// lib/services/evaluations.ts
const ADMIN_API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL;
const ADMIN_API_URL_FX = process.env.NEXT_PUBLIC_ADMIN_API_URL_FX;
const API_KEY = process.env.API_KEY;

interface ClientSession {
  user: {
    email?: string;
    cpf?: string;
  };
}

interface Evaluation {
  id: string;
  name: string;
  platform: string;
  plan: string;
  traderStatus: string;
  startDate?: Date;
  endDate?: Date;
  platformRenewal?: {
    platformStartDate: string | null;
    daysUntilExpiration: number | null;
    canRenew: boolean;
    isExpired: boolean;
    needsRenewal: boolean;
  };
  // ... outros campos da avaliação
}

export async function getClientEvaluations(session: ClientSession) {
  if (!session?.user?.email && !session?.user?.cpf) {
    throw new Error("Usuário não autenticado corretamente");
  }

  const queryParams = new URLSearchParams();
  if (session.user.email) queryParams.append("email", session.user.email);
  if (session.user.cpf) queryParams.append("cpf", session.user.cpf);

  try {
    // Buscar avaliações B3
    const responseB3 = await fetch(
      `${ADMIN_API_URL}/api/client-evaluations?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        next: { revalidate: 0 },
      }
    );

    // Buscar avaliações FX
    const responseFX = await fetch(
      `${ADMIN_API_URL_FX}/api/client-evaluations?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        next: { revalidate: 0 },
      }
    );

    const evaluations = [];

    // Processar B3
    if (responseB3.ok) {
      const dataB3 = await responseB3.json();
      if (dataB3.evaluations?.length > 0) {
        evaluations.push(
          ...dataB3.evaluations.map((evaluation: Evaluation) => ({
            ...evaluation,
            type: "B3",
          }))
        );
      }
    }

    // Processar FX
    if (responseFX.ok) {
      const dataFX = await responseFX.json();
      if (dataFX.evaluations?.length > 0) {
        evaluations.push(
          ...dataFX.evaluations.map((evaluation: Evaluation) => ({
            ...evaluation,
            type: "FX",
          }))
        );
      }
    }

    // Se nenhuma avaliação foi encontrada
    if (evaluations.length === 0) {
      return {
        evaluations: [],
        message: "Você ainda não possui nenhuma avaliação cadastrada.",
      };
    }

    return {
      evaluations,
      message: `${evaluations.length} avaliação(ões) encontrada(s)`,
    };
  } catch (error) {
    console.error("[Cliente] Erro ao buscar avaliações:", error);
    throw error;
  }
}
