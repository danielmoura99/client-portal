// lib/services/evaluations.ts
const ADMIN_API_URL =
  process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:3001";
const API_KEY = process.env.API_KEY;

interface ClientSession {
  user: {
    email?: string;
    cpf?: string;
  };
}

export async function getClientEvaluations(session: ClientSession) {
  if (!session?.user?.email && !session?.user?.cpf) {
    throw new Error("Usuário não autenticado corretamente");
  }

  const queryParams = new URLSearchParams();
  if (session.user.email) queryParams.append("email", session.user.email);
  if (session.user.cpf) queryParams.append("cpf", session.user.cpf);

  try {
    const response = await fetch(
      `${ADMIN_API_URL}/api/client-evaluations?${queryParams}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
        },
        next: { revalidate: 0 }, // Desabilita o cache para sempre ter dados atualizados
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Verifica se temos o array de avaliações
    if (!data.evaluations) {
      console.log("Nenhuma avaliação encontrada nos dados:", data);
      return { evaluations: [] };
    }

    return data;
  } catch (error) {
    console.error("[Cliente] Erro ao buscar avaliações:", error);
    throw error;
  }
}
