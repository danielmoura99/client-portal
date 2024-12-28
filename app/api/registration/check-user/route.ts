// client-portal/app/api/registration/check-user/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const document = searchParams.get("document");

    if (!email && !document) {
      return Response.json(
        { error: "Email ou CPF são necessários" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email || undefined },
          { document: document || undefined },
        ],
      },
      select: {
        name: true,
        email: true,
        document: true,
        phone: true,
        address: true,
        zipCode: true,
      },
    });

    return Response.json({ user });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return Response.json({ error: "Erro interno" }, { status: 500 });
  }
}
