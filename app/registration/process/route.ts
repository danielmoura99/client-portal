// client-portal/app/registration/process/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("[API] Chamada à rota /registration/process");
    console.log("[API] Dados recebidos:", data);

    if (!data.type) {
      throw new Error("Tipo de avaliação não especificado");
    }

    // Determinação do cenário
    const isCombo = data.combo === "true";
    const mainCourseId = data.courseId;

    // Processa IDs de cursos adicionais (orderBump e additionalCourses)
    const orderBumpCourseIds = data.orderBumpCourseIds
      ? Array.isArray(data.orderBumpCourseIds)
        ? data.orderBumpCourseIds
        : data.orderBumpCourseIds.split(",")
      : [];

    const additionalCourseIds = data.additionalCourseIds
      ? Array.isArray(data.additionalCourseIds)
        ? data.additionalCourseIds
        : data.additionalCourseIds.split(",")
      : [];

    // Todos os IDs de cursos a liberar
    const allEducationalIds = [
      ...(isCombo && mainCourseId ? [mainCourseId] : []),
      ...orderBumpCourseIds,
      ...additionalCourseIds,
    ].filter(Boolean);

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
    } else {
      userId = existingUser.id;
      console.log("[API] Usuário existente:", userId);
    }

    // Se há produtos educacionais, processar
    if (allEducationalIds.length > 0) {
      await processEducationalProducts(userId, allEducationalIds);
      console.log(
        "[API] Produtos educacionais processados:",
        allEducationalIds
      );
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
      educationalProductsAdded:
        allEducationalIds.length > 0 ? allEducationalIds : undefined,
      isCombo: isCombo,
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

// Função auxiliar para processar produtos educacionais
async function processEducationalProducts(
  userId: string,
  productIds: string[]
) {
  try {
    // Verificar quais produtos existem antes de criar relacionamentos
    const existingProducts = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      select: { id: true },
    });

    // Extrair os IDs dos produtos existentes
    const validProductIds = existingProducts.map((product) => product.id);

    if (validProductIds.length === 0) {
      console.warn("[API] Nenhum produto educacional válido encontrado");
      return;
    }

    // Criar entradas na tabela UserProduct para cada produto válido
    for (const productId of validProductIds) {
      // Calcular a data de expiração (365 dias a partir de hoje)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 365);

      await prisma.userProduct.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          expiresAt: expirationDate,
        },
        create: {
          userId,
          productId,
          expiresAt: expirationDate, // Sem data de expiração por padrão
        },
      });
    }

    console.log(
      `[API] ${validProductIds.length} produtos educacionais liberados para o usuário ${userId}`
    );
  } catch (error) {
    console.error("[API] Erro ao processar produtos educacionais:", error);
    throw error;
  }
}
