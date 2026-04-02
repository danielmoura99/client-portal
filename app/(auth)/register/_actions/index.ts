// app/(auth)/register/_actions/index.ts
"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  document: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
})

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  document: string;
}) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0].message);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingUser) {
    throw new Error("Email já cadastrado");
  }

  const hashedPassword = await hashPassword(parsed.data.password);

  return await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      document: parsed.data.document,
    },
  });
}
