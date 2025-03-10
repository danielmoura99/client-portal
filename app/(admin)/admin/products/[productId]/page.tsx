// app/(admin)/admin/products/[productId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ProductForm } from "../_components/product-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: {
    productId: string;
  };
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Buscar o produto
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/admin/products">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Produtos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white mb-2">Editar Produto</h1>
        <p className="text-zinc-400">{product.name}</p>
      </div>

      <ProductForm initialData={product} />
    </div>
  );
}
