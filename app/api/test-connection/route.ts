// client-portal/app/api/test-connection/route.ts
import { getClientEvaluations } from "@/lib/services/evaluations";

export async function GET() {
  try {
    // Sessão de teste
    const testSession = {
      user: {
        email: "felipepdl@hotmail.com",
        cpf: "03430621941",
      },
    };

    console.log("Tentando buscar dados com:", testSession);
    const result = await getClientEvaluations(testSession);
    console.log("Resultado da busca:", result);

    if (!result) {
      console.log("Nenhum cliente encontrado com os dados fornecidos");
    }

    return Response.json({
      status: "success",
      data: result,
      message: result
        ? "Cliente encontrado"
        : "Nenhum cliente encontrado com estes dados",
    });
  } catch (error) {
    console.error("Erro no teste de conexão:", error);
    return Response.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
