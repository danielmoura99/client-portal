// app/api/admin/contents/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { mkdir } from "fs/promises";

// Função auxiliar para salvar arquivo
async function saveFile(file: File, destPath: string): Promise<string> {
  // Garantir que o diretório existe
  const dir = path.dirname(destPath);
  await mkdir(dir, { recursive: true });

  // Ler o arquivo como um array de bytes
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Escrever o arquivo no sistema
  await fs.promises.writeFile(destPath, buffer);

  return destPath;
}

export async function POST(req: NextRequest) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Processar formulário com upload de arquivo
    const formData = await req.formData();

    // Extrair dados do formulário
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as string;
    const productId = formData.get("productId") as string;
    const moduleId = formData.get("moduleId") as string | null;
    const finalModuleId =
      moduleId === "none" || moduleId === "" ? null : moduleId;
    let filePath = formData.get("path") as string;
    const sortOrder = Number(formData.get("sortOrder") || 0);

    // Validar dados essenciais
    if (!title || !type || !productId) {
      return Response.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Processar arquivo, se fornecido
    const file = formData.get("file") as File | null;

    if (file) {
      // Criar estrutura de diretório
      const baseDir = process.env.CONTENTS_DIR || "contents";

      // Garantir que o caminho está no formato esperado
      if (!filePath || !filePath.startsWith(baseDir)) {
        filePath = `${baseDir}/${productId}/${file.name}`;
      }

      // Caminho absoluto para salvar o arquivo
      const absolutePath = path.join(process.cwd(), filePath);

      // Salvar o arquivo
      await saveFile(file, absolutePath);
    }

    // Criar entrada no banco de dados para o conteúdo
    const content = await prisma.content.create({
      data: {
        title,
        description,
        type,
        path: filePath,
        sortOrder,
        // Não mais associado diretamente a um produto - a associação será criada separadamente
      },
    });

    // Agora criar a associação do conteúdo com o produto
    await prisma.productContent.create({
      data: {
        contentId: content.id,
        productId,
        moduleId: finalModuleId,
        sortOrder,
      },
    });

    return Response.json({ success: true, content });
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(req: NextRequest) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Buscar todos os conteúdos com suas associações a produtos
    const contents = await prisma.content.findMany({
      include: {
        productContents: {
          include: {
            product: true,
            module: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Formatar a resposta para facilitar o uso no frontend
    const formattedContents = contents.map((content) => {
      // Pegar a primeira associação de produto para exibição simples na lista
      const firstProductContent = content.productContents[0];

      return {
        ...content,
        productAssociations: content.productContents.map((pc) => ({
          productId: pc.productId,
          productName: pc.product.name,
          moduleId: pc.moduleId,
          moduleName: pc.module?.title || null,
          sortOrder: pc.sortOrder,
        })),
        // Campos para compatibilidade com o frontend existente
        primaryProduct: firstProductContent
          ? {
              id: firstProductContent.productId,
              name: firstProductContent.product.name,
            }
          : null,
        primaryModule: firstProductContent?.module || null,
        productContents: undefined, // Remover dados brutos para não sobrecarregar a resposta
      };
    });

    return Response.json(formattedContents);
  } catch (error) {
    console.error("Erro ao buscar conteúdos:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
