// app/api/requests/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();

    const validTypes = [
      "EVALUATION_APPROVAL",
      "START_DATE_CHANGE",
      "WITHDRAWAL",
      "PLATFORM_ISSUE",
      "GENERAL",
      "CAPITAL_REQUEST",
      "PLATFORM_REQUEST",
      "REAL_ACCOUNT_TRIGGER",
    ] as const;

    if (!data.type || !validTypes.includes(data.type)) {
      return new NextResponse("Tipo de chamado inválido", { status: 400 });
    }

    if (!data.description || typeof data.description !== "string" || data.description.trim().length === 0) {
      return new NextResponse("Descrição é obrigatória", { status: 400 });
    }

    if (data.description.length > 5000) {
      return new NextResponse("Descrição deve ter no máximo 5000 caracteres", { status: 400 });
    }

    const request = await prisma.request.create({
      data: {
        userId: session.user.id,
        type: data.type,
        description: data.description.trim(),
      },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("[REQUESTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "SUPPORT";

    const requests = await prisma.request.findMany({
      where: isAdmin ? undefined : { userId: session.user.id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        responses: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[REQUESTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
