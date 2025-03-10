// app/(admin)/admin/contents/[contentId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ContentForm } from "../_components/content-form";

interface PageProps {
  params: {
    contentId: string;
  };
}

export default async function EditContentPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Buscar o conteúdo
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

  // Buscar todos os produtos para o formulário
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Buscar todos os módulos do produto atual
  const modules = await prisma.module.findMany({
    where: { productId: content.productId },
    orderBy: { title: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href={`/admin/products/${content.productId}/contents`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conteúdos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white mb-2">Editar Conteúdo</h1>
        <p className="text-zinc-400">{content.title}</p>
      </div>

      <ContentForm
        initialData={{
          id: content.id,
          title: content.title,
          description: content.description || "",
          type: content.type,
          productId: content.productId,
          moduleId: content.moduleId || "",
          path: content.path,
          sortOrder: content.sortOrder,
        }}
        products={products}
        modules={modules}
      />
    </div>
  );
}
