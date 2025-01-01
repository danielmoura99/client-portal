// client-portal/app/api/registration/process/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("[API] Dados recebidos:", data);

    if (!data.type) {
      throw new Error("Tipo de avaliação não especificado");
    }

    const adminUrl =
      data.type === "B3"
        ? process.env.NEXT_PUBLIC_ADMIN_API_URL
        : process.env.NEXT_PUBLIC_ADMIN_API_URL_FX;

    console.log("[API pasta api] Usando URL:", adminUrl);
    console.log("[API pasta api] Tipo:", data.type);

    const apiKey = process.env.API_KEY;

    if (!adminUrl || !apiKey) {
      throw new Error("Configurações de API ausentes");
    }

    // Primeiro verifica se já existe um usuário
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { document: data.cpf }],
      },
    });

    let userId;
    let initialPassword;

    // Se não existir usuário, cria um novo
    if (!existingUser) {
      // Criar senha inicial (últimos 4 dígitos do CPF)
      initialPassword = data.cpf.slice(-4);
      const hashedPassword = await hash(initialPassword, 10);

      // Criar usuário no portal do cliente
      const newUser = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          document: data.cpf,
          password: hashedPassword,
          phone: data.phone,
          address: data.address,
          zipCode: data.zipCode,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      userId = newUser.id;
      console.log("[API] Novo usuário criado:", userId);
    }

    // Faz a requisição para o trader-evaluation para criar a avaliação
    const response = await fetch(`${adminUrl}/api/registration/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...data,
        skipUserCreation: true, // Sinaliza para não criar usuário no trader-evaluation
      }),
    });

    const responseData = await response.json();
    console.log("[API] Resposta do trader-evaluation:", responseData);

    if (!response.ok) {
      throw new Error(responseData.error || "Erro ao processar registro");
    }

    // Retorna a resposta incluindo as informações do usuário
    return Response.json({
      ...responseData,
      isNewUser: !existingUser,
      initialPassword: initialPassword,
    });
  } catch (error) {
    console.error("[API] Erro:", error);
    return Response.json(
      {
        error: "Erro interno do servidor",
        message: error instanceof Error ? error.message : "Erro desconhecido",
      },
      {
        status: 500,
      }
    );
  }
}
