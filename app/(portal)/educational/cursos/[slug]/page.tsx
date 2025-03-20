// app/(portal)/educational/cursos/[slug]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  checkUserAccess,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getProductContents,
} from "@/lib/services/access-control";
import { CourseInterface } from "./_components/course-interface";
import {
  getAccessibleModules,
  logUserProductAccess,
} from "@/lib/services/module-access-control";

// Definição dos tipos para os módulos
interface ModuleInfo {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
  isAccessible: boolean;
  releaseDate: string | null;
  contents: {
    id: string;
    title: string;
    type: string;
    path: string;
    description?: string | null;
    sortOrder: number;
  }[];
}

interface CoursePageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    content?: string;
  }>;
}

export default async function CoursePage({
  params,
  searchParams,
}: CoursePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }
  const resolvedSearchParams = await searchParams;
  const resolvedParams = await params;

  // Buscar o curso pelo slug
  const course = await prisma.product.findUnique({
    where: { slug: resolvedParams.slug },
    select: {
      id: true,
      name: true,
      description: true,
      type: true,
      slug: true,
      modules: {
        orderBy: {
          sortOrder: "asc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          sortOrder: true,
          immediateAccess: true,
          releaseAfterDays: true,
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Verificar acesso do usuário ao curso
  const hasAccess = await checkUserAccess(session.user.id, {
    productSlug: resolvedParams.slug,
  });

  if (!hasAccess) {
    redirect("/educational/cursos");
  }

  // Garantir que o acesso do usuário está registrado para cálculos de liberação
  try {
    await logUserProductAccess(session.user.id, course.id);
  } catch (error) {
    console.error("Erro ao registrar acesso do usuário:", error);
    // Continuar mesmo se houver erro no registro
  }

  // Buscar os módulos que o usuário pode acessar
  const accessibleModuleIds = await getAccessibleModules(
    session.user.id,
    course.id
  );

  // Obter o log de acesso para calcular datas de liberação futura
  const accessLog = await prisma.userProductAccessLog.findUnique({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId: course.id,
      },
    },
  });

  // Preparar arrays para módulos acessíveis e bloqueados
  const accessibleModules: ModuleInfo[] = [];
  const lockedModules: ModuleInfo[] = [];

  // Classificar cada módulo como acessível ou bloqueado
  for (const moduleItem of course.modules) {
    const isAccessible = accessibleModuleIds.includes(module.id);

    // Calcular data de liberação se não for acessível e tiver releaseAfterDays definido
    let releaseDate = null;
    if (!isAccessible && moduleItem.releaseAfterDays !== null && accessLog) {
      releaseDate = new Date(accessLog.accessGrantedAt);
      releaseDate.setDate(releaseDate.getDate() + moduleItem.releaseAfterDays);
    }

    const moduleInfo: ModuleInfo = {
      id: moduleItem.id,
      title: moduleItem.title,
      description: moduleItem.description,
      sortOrder: moduleItem.sortOrder,
      isAccessible,
      releaseDate: releaseDate ? releaseDate.toISOString() : null,
      contents: [], // Inicialmente vazio, preenchido depois para os acessíveis
    };

    if (isAccessible) {
      accessibleModules.push(moduleInfo);
    } else {
      lockedModules.push(moduleInfo);
    }
  }

  // Buscar conteúdos apenas para os módulos acessíveis
  const productContents = await prisma.productContent.findMany({
    where: {
      productId: course.id,
      OR: [
        { moduleId: { in: accessibleModuleIds } },
        { moduleId: null }, // Também incluir conteúdos sem módulo
      ],
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

  // Adicionar conteúdos aos módulos acessíveis
  for (const moduleWithContent of accessibleModules) {
    const contentsForModule = productContents
      .filter((pc) => pc.moduleId === moduleWithContent.id)
      .map((pc) => ({
        id: pc.content.id,
        title: pc.content.title,
        type: pc.content.type,
        path: pc.content.path,
        description: pc.content.description,
        sortOrder: pc.sortOrder,
      }));

    moduleWithContent.contents = contentsForModule;
  }

  // Adicionar conteúdos sem módulo em um "módulo" especial
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
    accessibleModules.push({
      id: "default",
      title: "Conteúdo Principals",
      description: "Materiais gerais do curso",
      sortOrder: 9999,
      isAccessible: true,
      releaseDate: null,
      contents: contentsWithoutModule,
    });
  }

  // Encontrar o conteúdo selecionado através do parâmetro content
  let initialSelectedContent = null;
  if (resolvedSearchParams?.content) {
    // Procurar o conteúdo em todos os módulos acessíveis
    for (const moduleItem of accessibleModules) {
      const found = moduleItem.contents.find(
        (c) => c.id === resolvedSearchParams.content
      );
      if (found) {
        initialSelectedContent = found;
        break;
      }
    }
  }

  // Se não houver conteúdo selecionado, usar o primeiro disponível
  if (!initialSelectedContent) {
    for (const moduleItem of accessibleModules) {
      if (moduleItem.contents.length > 0) {
        initialSelectedContent = moduleItem.contents[0];
        break;
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-100">{course.name}</h1>
        <p className="text-zinc-400">{course.description}</p>
      </div>

      {/* Componente do cliente para lidar com a interatividade */}
      <CourseInterface
        courseId={course.id}
        courseName={course.name}
        courseSlug={course.slug}
        accessibleModules={accessibleModules}
        lockedModules={lockedModules}
        initialSelectedContent={initialSelectedContent}
      />
    </div>
  );
}
