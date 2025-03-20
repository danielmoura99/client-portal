// app/api/courses/[slug]/route.ts - Versão atualizada
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { checkUserAccess } from "@/lib/services/access-control";
import { getAccessibleModules } from "@/lib/services/module-access-control";

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

    // Buscar os IDs dos módulos que o usuário pode acessar
    const accessibleModuleIds = await getAccessibleModules(
      session.user.id,
      course.id
    );

    // Buscar todos os módulos do curso, incluindo informações sobre liberação
    const allModules = await prisma.module.findMany({
      where: { productId: course.id },
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        sortOrder: true,
        immediateAccess: true,
        releaseAfterDays: true,
      },
    });

    // Buscar a data de acesso do usuário para calcular datas de liberação futuras
    const accessLog = await prisma.userProductAccessLog.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: course.id,
        },
      },
    });

    // Processar os módulos para mostrar informações de acesso
    const modulesWithAccessInfo = allModules.map((module) => {
      const isAccessible = accessibleModuleIds.includes(module.id);

      // Calcular data de liberação se não for acessível imediatamente
      let releaseDate = null;
      if (!isAccessible && module.releaseAfterDays !== null && accessLog) {
        releaseDate = new Date(accessLog.accessGrantedAt);
        releaseDate.setDate(releaseDate.getDate() + module.releaseAfterDays);
      }

      return {
        id: module.id,
        title: module.title,
        description: module.description,
        sortOrder: module.sortOrder,
        isAccessible,
        releaseDate: releaseDate ? releaseDate.toISOString() : null,
      };
    });

    // Buscar os conteúdos dos módulos acessíveis
    const productContents = await prisma.productContent.findMany({
      where: {
        productId: course.id,
        moduleId: { in: accessibleModuleIds },
      },
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

    // Organizar os conteúdos por módulo acessível
    const modulesWithContents = modulesWithAccessInfo
      .filter((module) => module.isAccessible)
      .map((module) => {
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

    // Criar um módulo especial para conteúdos sem módulo
    if (contentsWithoutModule.length > 0) {
      modulesWithContents.push({
        id: "default",
        title: "Conteúdo Principal",
        description: "Materiais gerais do curso",
        sortOrder: 9999,
        isAccessible: true,
        releaseDate: null,
        contents: contentsWithoutModule,
      });
    }

    // Agora também incluímos os módulos não acessíveis na resposta
    const lockedModules = modulesWithAccessInfo.filter(
      (module) => !module.isAccessible
    );

    return Response.json({
      course,
      accessibleModules: modulesWithContents,
      lockedModules: lockedModules,
    });
  } catch (error) {
    console.error("Erro ao buscar detalhes do curso:", error);
    return Response.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
