// app/api/evaluations/user/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { getClientEvaluations } from "@/lib/services/evaluations";

export async function GET() {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const result = await getClientEvaluations({ user: session.user });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[User Evaluations] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar avaliações" },
      { status: 500 }
    );
  }
}
