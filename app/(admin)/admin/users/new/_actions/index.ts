// app/(admin)/admin/users/new/_actions/index.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Schema para validação
const userSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  document: z.string().min(1),
  phone: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN", "SUPPORT"]).default("USER"),
});

// Criar usuário
export async function createUser(data: z.infer<typeof userSchema>) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Não autorizado");
  }

  // Validar dados
  const validatedData = userSchema.parse(data);

  try {
    // Verificar se já existe um usuário com este email
    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingEmail) {
      throw new Error("Já existe um usuário com este email");
    }

    // Verificar se já existe um usuário com este documento
    const existingDocument = await prisma.user.findUnique({
      where: { document: validatedData.document },
    });

    if (existingDocument) {
      throw new Error("Já existe um usuário com este documento");
    }

    // Hash da senha
    const hashedPassword = await hash(validatedData.password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        document: validatedData.document,
        password: hashedPassword,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        zipCode: validatedData.zipCode || null,
        role: validatedData.role,
        firstAccess: true, // Usuário terá que trocar a senha no primeiro acesso
      },
    });

    revalidatePath("/admin/users");
    return { success: true, user };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    throw error;
  }
}
