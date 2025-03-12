// app/api/courses/[slug]/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { checkUserAccess } from "@/lib/services/access-control";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }
    const resolvedparams = await params;
    const slug = resolvedparams.slug;

    // Buscar o curso pelo slug
    const course = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        slug: true,
      },
    });

    if (!course) {
      return Response.json({ error: "Curso não encontrado" }, { status: 404 });
    }

    // Verificar acesso do usuário ao curso
    const hasAccess = await checkUserAccess(session.user.id, {
      productSlug: slug,
    });

    if (!hasAccess) {
      return Response.json(
        { error: "Acesso não autorizado a este curso" },
        { status: 403 }
      );
    }

    // Buscar os módulos do curso
    const modules = await prisma.module.findMany({
      where: { productId: course.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        sortOrder: true,
      },
    });

    // Buscar todos os conteúdos do produto, agrupados por módulo
    const productContents = await prisma.productContent.findMany({
      where: { productId: course.id },
      include: {
        content: true,
        module: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Organizar os conteúdos por módulo
    const modulesWithContents = modules.map((module) => {
      const moduleContents = productContents
        .filter((pc) => pc.moduleId === module.id)
        .map((pc) => ({
          id: pc.content.id,
          title: pc.content.title,
          type: pc.content.type,
          path: pc.content.path,
          description: pc.content.description,
          sortOrder: pc.sortOrder,
        }));

      return {
        ...module,
        contents: moduleContents,
      };
    });

    // Adicionar conteúdos sem módulo
    const contentsWithoutModule = productContents
      .filter((pc) => !pc.moduleId)
      .map((pc) => ({
        id: pc.content.id,
        title: pc.content.title,
        type: pc.content.type,
        path: pc.content.path,
        description: pc.content.description,
        sortOrder: pc.sortOrder,
      }));

    if (contentsWithoutModule.length > 0) {
      modulesWithContents.push({
        id: "default",
        title: "Conteúdo Principal",
        description: "Materiais gerais do curso",
        sortOrder: 9999,
        contents: contentsWithoutModule,
      });
    }

    return Response.json({
      course,
      modules: modulesWithContents,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do curso:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
