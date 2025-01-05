// app/api/requests/[requestId]/status/route.ts
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

interface RequestContext {
  params: Promise<{ requestId: string }>;
}

export async function PATCH(req: Request, context: RequestContext) {
  try {
    const session = await getServerSession(authOptions);
    const resolvedParams = await context.params;
    const { requestId } = resolvedParams;

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Apenas admin e support podem alterar status
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const data = await req.json();

    const request = await prisma.request.update({
      where: { id: requestId },
      data: { status: data.status },
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("[REQUEST_STATUS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
