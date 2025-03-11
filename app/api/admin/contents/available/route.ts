// app/api/admin/contents/available/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Extrair parâmetros da consulta
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");

    // Buscar todos os conteúdos
    const contents = await prisma.content.findMany({
      include: {
        productContents: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        title: "asc",
      },
    });

    // Filtrar conteúdos que ainda não estão associados ao produto especificado, se um productId foi fornecido
    let availableContents = contents;

    if (productId) {
      availableContents = contents.filter((content) => {
        // Verifica se o conteúdo não está associado ao produto especificado
        return !content.productContents.some(
          (pc) => pc.productId === productId
        );
      });
    }

    // Formatar os conteúdos para a resposta
    const formattedContents = availableContents.map((content) => {
      const productAssociations = content.productContents.map((pc) => ({
        productId: pc.productId,
        productName: pc.product.name,
      }));

      // Obtém o primeiro produto associado para compatibilidade com o frontend existente
      const primaryAssociation = content.productContents[0];

      return {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        path: content.path,
        // Campos para compatibilidade com frontend existente
        product: primaryAssociation?.product || null,
        // Novos campos com informações mais detalhadas
        productAssociations,
        // Remover campos brutos da resposta
        productContents: undefined,
      };
    });

    return Response.json({ contents: formattedContents });
  } catch (error) {
    console.error("Erro ao buscar conteúdos disponíveis:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
