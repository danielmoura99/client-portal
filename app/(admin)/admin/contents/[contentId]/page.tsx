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

  // Buscar o conteúdo conforme definido no schema Prisma
  const content = await prisma.content.findUnique({
    where: { id: params.contentId },
    include: {
      // Usando o nome correto do campo na relação
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

  // Buscar módulos para os produtos relacionados a este conteúdo
  const productIds = content.productContents.map((pc) => pc.productId);

  // Se houver pelo menos um produto associado, use o primeiro como padrão
  const defaultProductId = productIds.length > 0 ? productIds[0] : undefined;

  // Buscar módulos relacionados aos produtos
  const modules = await prisma.module.findMany({
    where: {
      productId: {
        in: productIds,
      },
    },
    orderBy: { title: "asc" },
  });

  // Se tivermos vários produtos, vamos usar o primeiro para exibição no formulário
  const firstProductContent = content.productContents[0];

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link
            href={
              firstProductContent
                ? `/admin/products/${firstProductContent.productId}/contents`
                : "/admin/contents"
            }
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para{" "}
            {firstProductContent ? "Conteúdos do Produto" : "Conteúdos"}
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
          // Se houver produto associado, use o primeiro
          productId: defaultProductId || "",
          // Se o primeiro produto tiver módulo, use-o
          moduleId: firstProductContent?.moduleId || "",
          // Use a ordem do primeiro produto, se disponível
          sortOrder: firstProductContent?.sortOrder || 0,
          // Ajustado para o tipo esperado pelo componente ContentForm
          // Nota: Isso depende de como está definido no ContentForm
        }}
        products={products}
        modules={modules}
        // Passamos separadamente as informações de produto-conteúdo
        productContents={content.productContents.map((pc) => ({
          productId: pc.productId,
          moduleId: pc.moduleId,
          sortOrder: pc.sortOrder,
        }))}
      />
    </div>
  );
}
