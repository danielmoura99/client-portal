// app/(portal)/educational/cursos/conteudo/[contentId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkUserAccess } from "@/lib/services/access-control";
import { ContentViewer } from "../../../_components/content-viewer";
import { ContentList } from "../../../_components/content-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface ContentPageProps {
  params: {
    contentId: string;
  };
}

export default async function ContentPage({ params }: ContentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar o conteúdo solicitado
  const content = await prisma.content.findUnique({
    where: { id: params.contentId },
    include: {
      product: true,
      module: true,
    },
  });

  if (!content) {
    notFound();
  }

  // Verificar acesso do usuário ao conteúdo
  const hasAccess = await checkUserAccess(session.user.id, {
    contentId: params.contentId,
  });

  if (!hasAccess) {
    redirect("/educational/cursos");
  }

  // Buscar todos os conteúdos do produto para exibir no menu lateral
  const allContents = await prisma.content.findMany({
    where: { productId: content.productId },
    include: { module: true },
    orderBy: { sortOrder: "asc" },
  });

  // Agrupar conteúdos por módulo
  const moduleMap = new Map();

  // Adicionar conteúdos sem módulo em um grupo "default"
  const noModuleContents = allContents.filter((c) => !c.moduleId);
  if (noModuleContents.length > 0) {
    moduleMap.set("default", {
      id: "default",
      title: "Conteúdo Principal",
      contents: noModuleContents,
    });
  }

  // Agrupar o resto dos conteúdos por seus módulos
  allContents
    .filter((c) => c.moduleId)
    .forEach((c) => {
      if (!moduleMap.has(c.moduleId)) {
        moduleMap.set(c.moduleId, {
          id: c.module?.id,
          title: c.module?.title,
          contents: [],
        });
      }

      moduleMap.get(c.moduleId).contents.push(c);
    });

  // Converter o mapa em array para renderização
  const modules = Array.from(moduleMap.values());

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center">
          <Button asChild variant="ghost" size="sm" className="mr-2">
            <Link href={`/educational/cursos/${content.product.slug}`}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Voltar ao curso
            </Link>
          </Button>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">{content.title}</h1>
        {content.description && (
          <p className="text-zinc-400">{content.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Lista de conteúdos */}
        <div className="md:col-span-1 order-2 md:order-1">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 sticky top-4">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              {content.product.name}
            </h2>

            <ContentList
              modules={modules}
              currentContentId={params.contentId}
            />
          </div>
        </div>

        {/* Área de visualização de conteúdo */}
        <div className="md:col-span-2 order-1 md:order-2">
          <ContentViewer content={content} />
        </div>
      </div>
    </div>
  );
}
