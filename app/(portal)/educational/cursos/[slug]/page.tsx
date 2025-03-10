// app/(portal)/educational/cursos/[slug]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  checkUserAccess,
  getProductContents,
} from "@/lib/services/access-control";
import { ContentList } from "../../_components/content-list";

interface CoursePageProps {
  params: {
    slug: string;
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar o curso pelo slug
  const course = await prisma.product.findUnique({
    where: { slug: params.slug },
  });

  if (!course) {
    notFound();
  }

  // Verificar acesso do usuário ao curso
  const hasAccess = await checkUserAccess(session.user.id, {
    productSlug: params.slug,
  });

  if (!hasAccess) {
    redirect("/educational/cursos");
  }

  // Buscar conteúdos do curso
  const contents = await getProductContents(course.id);

  // Agrupar conteúdos por módulo
  const moduleMap = new Map();

  // Adicionar conteúdos sem módulo em um grupo "default"
  const noModuleContents = contents.filter((content) => !content.moduleId);
  if (noModuleContents.length > 0) {
    moduleMap.set("default", {
      id: "default",
      title: "Conteúdo Principal",
      contents: noModuleContents,
    });
  }

  // Agrupar o resto dos conteúdos por seus módulos
  contents
    .filter((content) => content.moduleId)
    .forEach((content) => {
      if (!moduleMap.has(content.moduleId)) {
        moduleMap.set(content.moduleId, {
          id: content.module?.id,
          title: content.module?.title,
          contents: [],
        });
      }

      moduleMap.get(content.moduleId).contents.push(content);
    });

  // Converter o mapa em array para renderização
  const modules = Array.from(moduleMap.values());

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-100">{course.name}</h1>
        <p className="text-zinc-400">{course.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de conteúdos */}
        <div className="md:col-span-1">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              Conteúdo do Curso
            </h2>

            <ContentList modules={modules} />
          </div>
        </div>

        {/* Área de visualização de conteúdo */}
        <div className="md:col-span-2">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 h-full">
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-400">
                Selecione um conteúdo para começar a aprender.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
