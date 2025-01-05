// app/(auth)/register/_actions/index.ts
"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  document: string; // Adicionando campo obrigatório
}) {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email já cadastrado");
  }

  const hashedPassword = await hashPassword(data.password);

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      document: data.document,
    },
  });
}
