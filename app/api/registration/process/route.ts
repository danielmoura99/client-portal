// client-portal/app/api/registration/process/route.ts - VERSÃO CORRIGIDA
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { logUserProductAccess } from "@/lib/services/module-access-control";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    console.log("[API] Chamada à rota /api/registration/process");
    console.log("[API] Dados recebidos:", data);

    // Função auxiliar para processar IDs que podem vir como string separada por vírgula
    const processIds = (ids: string | null | undefined): string[] => {
      if (!ids) return [];
      return ids
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);
    };

    // Extrair parâmetros dos dados enviados pelo formulário
    let isCombo = false;
    let mainCourseIds: string[] = [];
    let orderBumpCourseIds: string[] = [];
    let additionalCourseIds: string[] = [];

    // Verificar se os parâmetros da URL foram incluídos no payload
    if (data.urlParams) {
      isCombo = data.urlParams.isCombo === true;

      // ✅ CORREÇÃO: Processar courseId corretamente mesmo quando vem como "3,5"
      mainCourseIds = processIds(data.urlParams.courseId);
      orderBumpCourseIds = processIds(data.urlParams.orderBumpCourseIds);
      additionalCourseIds = processIds(data.urlParams.additionalCourseIds);

      // Remover do payload para não enviar para o serviço externo
      delete data.urlParams;
    } else {
      // Como fallback, tenta extrair da URL da API (comportamento original)
      const url = new URL(request.url);
      isCombo = url.searchParams.get("combo") === "true";

      mainCourseIds = processIds(url.searchParams.get("courseId"));
      orderBumpCourseIds = processIds(
        url.searchParams.get("orderBumpCourseIds")
      );
      additionalCourseIds = processIds(
        url.searchParams.get("additionalCourseIds")
      );
    }

    console.log("[API] Parâmetros processados:", {
      isCombo,
      mainCourseIds,
      orderBumpCourseIds,
      additionalCourseIds,
    });

    if (!data.type) {
      throw new Error("Tipo de avaliação não especificado");
    }

    // Todos os IDs de cursos a liberar (agora corretamente processados)
    const allEducationalIds = [
      ...(isCombo ? mainCourseIds : []),
      ...orderBumpCourseIds,
      ...additionalCourseIds,
    ].filter(Boolean);

    console.log(
      "[API] IDs de produtos educacionais a processar:",
      allEducationalIds
    );

    // Determina a URL da API com base no tipo de avaliação
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
    } else {
      console.log("[API] Nenhum produto educacional a processar");
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

    // Retorna a resposta incluindo as informações do usuário e produtos educacionais
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

// Função auxiliar para processar produtos educacionais (sem alterações na lógica interna)
async function processEducationalProducts(userId: string, courseIds: string[]) {
  try {
    console.log("[API] Procurando produtos pelo courseId:", courseIds);

    // Converter os courseIds de string para número (já que no banco devem ser números)
    const numericCourseIds = courseIds
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id)); // Remover valores que não são números

    if (numericCourseIds.length === 0) {
      console.warn("[API] Nenhum courseId válido encontrado após conversão");
      return;
    }

    // Verificar quais produtos existem antes de criar relacionamentos
    // Agora buscando por courseId em vez de id
    const existingProducts = await prisma.product.findMany({
      where: {
        courseId: {
          in: numericCourseIds,
        },
      },
      select: { id: true, courseId: true, name: true },
    });

    console.log("[API] Produtos encontrados:", existingProducts);

    if (existingProducts.length === 0) {
      console.warn(
        "[API] Nenhum produto educacional válido encontrado para os courseIds fornecidos"
      );
      return;
    }

    // Criar entradas na tabela UserProduct para cada produto encontrado
    for (const product of existingProducts) {
      // Calcular a data de expiração (365 dias a partir de hoje)
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 365);

      await prisma.userProduct.upsert({
        where: {
          userId_productId: {
            userId,
            productId: product.id, // Usar o id real do produto na relação
          },
        },
        update: {
          // Atualiza a data de expiração sempre que o produto for adicionado novamente
          expiresAt: expirationDate,
        },
        create: {
          userId,
          productId: product.id, // Usar o id real do produto na relação
          expiresAt: expirationDate, // Expira em 365 dias
        },
      });

      await logUserProductAccess(userId, product.id);

      console.log(
        `[API] Produto ${product.name} (courseId: ${product.courseId}) liberado para o usuário ${userId}`
      );
    }

    console.log(
      `[API] ${existingProducts.length} produtos educacionais liberados para o usuário ${userId}`
    );
  } catch (error) {
    console.error("[API] Erro ao processar produtos educacionais:", error);
    throw error;
  }
}
