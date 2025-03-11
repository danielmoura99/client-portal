/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import ProductContentsTable from "./_components/product-contents-table";
import ModuleList from "./_components/module-list";
import ContentViewToggle from "./_components/content-view-toggle";
import { AddExistingContentDialog } from "./_components/add-existing-content-dialog";

interface ProductContentsClientPageProps {
  productId: string;
  initialProduct: {
    id: string;
    name: string;
    description: string;
    type: string;
    slug: string;
    productContents: any[]; // Agora usamos productContents em vez de contents
    modules: any[];
  };
}

export default function ProductContentsClientPage({
  productId,
  initialProduct,
}: ProductContentsClientPageProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [product, setProduct] = useState(initialProduct);
  const [activeView, setActiveView] = useState<"modules" | "contents">(
    "modules"
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

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
          {activeView === "modules" ? (
            <Button asChild>
              <Link href={`/admin/products/${productId}/contents/modules/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Módulo
              </Link>
            </Button>
          ) : (
            <>
              <AddExistingContentDialog productId={product.id} />
              <Button asChild>
                <Link href={`/admin/contents/new?productId=${productId}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Conteúdo
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <ContentViewToggle onViewChange={setActiveView} defaultView="modules" />

      {activeView === "modules" ? (
        /* Seção de módulos */
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <ModuleList modules={product.modules} productId={product.id} />
        </div>
      ) : /* Lista de conteúdos */
      product.productContents.length > 0 ? (
        <ProductContentsTable
          initialContents={product.productContents}
          productId={product.id}
        />
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 text-center">
          <p className="text-zinc-400">
            Este produto ainda não possui conteúdos.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <AddExistingContentDialog productId={product.id} />
            <Button asChild>
              <Link href={`/admin/contents/new?productId=${productId}`}>
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Conteúdo
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
