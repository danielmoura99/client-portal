// app/(portal)/profile/_actions/index.ts
"use server";

import { User } from "@/types";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserProfile(userId: string): Promise<User | null> {
  return await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      address: true,
      zipCode: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    zipCode?: string;
  }
) {
  // Atualiza no banco local
  await prisma.user.update({
    where: { id: userId },
    data,
  });

  // TODO: Sincronizar com sistema de controle via API
  // await syncWithControlSystem(userId, data);

  revalidatePath("/profile");
}
