// app/api/requests/[requestId]/responses/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

interface RequestContext {
  params: Promise<{ requestId: string }>;
}

export async function POST(req: Request, context: RequestContext) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await context.params;
    const { requestId } = resolvedParams;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();

    // Verifica se a solicitação existe e se o usuário tem permissão
    const request = await prisma.request.findUnique({
      where: { id: requestId },
      select: { userId: true },
    });

    if (!request) {
      return new NextResponse("Request not found", { status: 404 });
    }

    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "SUPPORT";

    // Se não for admin, verifica se é o dono da solicitação
    if (!isAdmin && request.userId !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await prisma.requestResponse.create({
      data: {
        requestId,
        message: data.message,
        isFromAdmin: isAdmin,
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[REQUEST_RESPONSES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
