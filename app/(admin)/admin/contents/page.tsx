// app/(admin)/admin/contents/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ContentTable from "./_components/content-table";

export default async function AdminContentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Buscar todos os conteúdos com seus produtos relacionados através de productContents
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

  // Transformar os dados para manter compatibilidade com o componente ContentTable
  const formattedContents = contents.map((content) => {
    // Pegar o primeiro relacionamento de produto, se existir
    const firstProductContent = content.productContents[0];

    return {
      ...content,
      // Adicionar campos para compatibilidade com o componente atual
      product: firstProductContent?.product || null,
      module: firstProductContent?.module || null,
      productId: firstProductContent?.productId || null,
      moduleId: firstProductContent?.moduleId || null,
      // Outros campos que possam ser necessários
      _count: {
        productContents: content.productContents.length,
      },
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Conteúdos</h1>
          <p className="text-zinc-400">
            Gerencie arquivos, vídeos e outros conteúdos
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/contents/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Conteúdo
          </Link>
        </Button>
      </div>

      <ContentTable initialContents={formattedContents} />
    </div>
  );
}
