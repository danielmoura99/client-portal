/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import ProductContentsTable from "./_components/product-contents-table";
import ModuleList from "./_components/module-list";
import ContentViewToggle from "./_components/content-view-toggle";
import { Separator } from "@/components/ui/separator";
import { fetchProductWithContents } from "./_actions";

interface ProductContentsClientPageProps {
  productId: string;
  initialProduct: {
    id: string;
    name: string;
    description: string;
    type: string;
    slug: string;
    contents: any[];
    modules: any[];
  };
}

export default function ProductContentsClientPage({
  productId,
  initialProduct,
}: ProductContentsClientPageProps) {
  const [product, setProduct] = useState(initialProduct);
  const [activeView, setActiveView] = useState<"modules" | "contents">(
    "modules"
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const session = await getSession();

      if (!session?.user || session.user.role !== "ADMIN") {
        redirect("/admin");
      }
    };

    checkAuth();
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshData = async () => {
    try {
      const updatedProduct = await fetchProductWithContents(productId);
      if (updatedProduct) {
        setProduct(updatedProduct);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

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
            Gerenciar Produto
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
            <Button asChild>
              <Link href={`/admin/contents/new?productId=${productId}`}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Conteúdo
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      <ContentViewToggle onViewChange={setActiveView} defaultView="modules" />

      {activeView === "modules" ? (
        /* Seção de módulos */
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <ModuleList modules={product.modules} productId={product.id} />
        </div>
      ) : /* Lista de conteúdos */
      product.contents.length > 0 ? (
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
            <Link href={`/admin/contents/new?productId=${productId}`}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Conteúdo
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
