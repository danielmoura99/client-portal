// app/(portal)/educational/cursos/[slug]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  checkUserAccess,
  getProductContents,
} from "@/lib/services/access-control";
import { CourseInterface } from "./_components/course-interface";

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

  // Buscar conteúdos do curso
  const productContents = await getProductContents(course.id);

  // Organizar os conteúdos por módulo
  const modulesWithContents = course.modules.map((module) => {
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

  // Encontrar o conteúdo selecionado através do parâmetro content
  let initialSelectedContent = null;
  if (resolvedSearchParams?.content) {
    // Procurar o conteúdo em todos os módulos
    for (const moduleItem of modulesWithContents) {
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
    for (const moduleItem of modulesWithContents) {
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
        modules={modulesWithContents}
        initialSelectedContent={initialSelectedContent}
      />
    </div>
  );
}
