// app/(admin)/admin/products/[productId]/contents/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import ProductContentsTable from "./_components/product-contents-table";

interface PageProps {
  params: {
    productId: string;
  };
}

export default async function ProductContentsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Buscar o produto com seus conteúdos
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: {
      contents: {
        include: {
          module: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      modules: {
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/admin/products">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para Produtos
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-white mb-2">
            Conteúdos do Produto
          </h1>
          <p className="text-zinc-400">{product.name}</p>
        </div>

        <div className="flex gap-2">
          <Button asChild>
            <Link
              href={`/admin/products/${params.productId}/contents/modules/new`}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Módulo
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/contents/new?productId=${params.productId}`}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Conteúdo
            </Link>
          </Button>
        </div>
      </div>

      {/* Exibir informações sobre os módulos, se houver */}
      {product.modules.length > 0 && (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-2">Módulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {product.modules.map((module) => (
              <div
                key={module.id}
                className="p-3 border border-zinc-800 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-zinc-200">
                      {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-xs text-zinc-400 mt-1">
                        {module.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={`/admin/products/${params.productId}/contents/modules/${module.id}`}
                  >
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lista de conteúdos */}
      {product.contents.length > 0 ? (
        <ProductContentsTable
          initialContents={product.contents}
          productId={product.id}
        />
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center">
          <p className="text-zinc-400">
            Este produto ainda não possui conteúdos.
          </p>
          <Button asChild className="mt-4">
            <Link href={`/admin/contents/new?productId=${params.productId}`}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Conteúdo
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
