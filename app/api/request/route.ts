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

    const request = await prisma.request.create({
      data: {
        userId: session.user.id,
        type: data.type,
        description: data.description,
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
