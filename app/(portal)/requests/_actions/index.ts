// /app/(portal)/requests/_actions/index.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { revalidatePath } from "next/cache";
import { RequestStatus } from "@/types";

interface CreateRequestData {
  type: string;
  description: string;
}

export async function createRequest(data: CreateRequestData) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const request = await prisma.request.create({
    data: {
      userId: session.user.id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: data.type as any,
      description: data.description,
    },
  });

  revalidatePath("/requests");
  return request;
}

export async function getRequests(status?: RequestStatus | "") {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const whereClause = status ? { status } : {};

  // Se for admin, retorna todas as solicitações
  if (session.user.role === "ADMIN") {
    return prisma.request.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        responses: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  // Se for usuário comum, retorna apenas suas solicitações
  return prisma.request.findMany({
    where: {
      userId: session.user.id,
      ...whereClause,
    },
    include: {
      responses: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function addResponse(requestId: string, message: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const isAdmin =
    session.user.role === "ADMIN" || session.user.role === "SUPPORT";

  const response = await prisma.requestResponse.create({
    data: {
      requestId,
      message,
      isFromAdmin: isAdmin,
    },
  });

  revalidatePath("/requests");
  return response;
}

export async function updateRequestStatus(
  requestId: string,
  status: RequestStatus
) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "SUPPORT")
  ) {
    throw new Error("Unauthorized");
  }

  const request = await prisma.request.update({
    where: { id: requestId },
    data: { status },
  });

  revalidatePath("/requests");
  return request;
}
