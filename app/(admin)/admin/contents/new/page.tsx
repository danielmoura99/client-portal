// app/(admin)/admin/contents/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ContentForm } from "../_components/content-form";

export default async function NewContentPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Obter o productId do parâmetro de consulta, se fornecido
  const productId = searchParams.productId as string | undefined;

  // Buscar produtos para o seletor
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Buscar módulos para o seletor
  // Se productId for fornecido, buscar apenas os módulos desse produto
  const modules = await prisma.module.findMany({
    where: productId ? { productId } : undefined,
    orderBy: { title: "asc" },
    include: { product: true },
  });

  // Determinar pra onde voltar, dependendo de onde viemos
  const backLink = productId
    ? `/admin/products/${productId}/contents`
    : "/admin/contents";

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href={backLink}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para {productId ? "Conteúdos do Produto" : "Conteúdos"}
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white mb-2">Novo Conteúdo</h1>
        <p className="text-zinc-400">Adicione um novo arquivo ou conteúdo</p>
      </div>

      <ContentForm
        products={products}
        modules={modules}
        defaultProductId={productId}
        // Corrigido para productContents ao invés de initialProductContents
        productContents={
          productId
            ? [
                {
                  productId: productId,
                  moduleId: null,
                  sortOrder: 0,
                },
              ]
            : []
        }
      />
    </div>
  );
}
