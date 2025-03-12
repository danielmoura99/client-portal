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

  // Buscar o conteúdo com suas associações a produtos e módulos
  const content = await prisma.content.findUnique({
    where: { id: params.contentId },
    include: {
      productContents: {
        include: {
          product: true,
          module: true,
        },
      },
    },
  });

  if (!content) {
    notFound();
  }

  // Buscar todos os produtos para o formulário
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Determinar o produto principal (usaremos o primeiro)
  const primaryProductContent = content.productContents[0];
  const primaryProductId = primaryProductContent?.productId;

  // Buscar todos os módulos associados aos produtos do conteúdo
  const productIds = content.productContents.map((pc) => pc.productId);
  const modules = await prisma.module.findMany({
    where: {
      productId: {
        in: productIds,
      },
    },
    orderBy: { title: "asc" },
  });

  // Determinar para onde voltar
  const backUrl = primaryProductId
    ? `/admin/products/${primaryProductId}/contents`
    : "/admin/contents";

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href={backUrl}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para{" "}
            {primaryProductId ? "Conteúdos do Produto" : "Conteúdos"}
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
          path: content.path,
          // Usamos o primeiro produto associado como principal
          productId: primaryProductId || "",
          // Usamos o primeiro módulo associado, se existir
          moduleId: primaryProductContent?.moduleId || "",
          // Usamos a ordem do primeiro produto
          sortOrder: primaryProductContent?.sortOrder || 0,
        }}
        products={products}
        modules={modules}
        productContents={content.productContents.map((pc) => ({
          productId: pc.productId,
          moduleId: pc.moduleId,
          sortOrder: pc.sortOrder,
        }))}
      />
    </div>
  );
}
