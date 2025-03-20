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
  params: Promise<{ [productId: string]: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await params;

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Buscar o produto
  const product = await prisma.product.findUnique({
    where: { id: resolvedSearchParams.productId },
  });

  if (!product) {
    notFound();
  }

  const formattedProduct = {
    id: product.id,
    courseId: product.courseId,
    name: product.name,
    description: product.description,
    type: product.type,
    slug: product.slug,
    // Transformar 'string | null' para 'string | undefined'
    coverImage: product.coverImage || undefined,
  };

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
        <p className="text-zinc-400">
          {product.name}{" "}
          <span className="ml-2 text-blue-400">ID: {product.courseId}</span>
        </p>
      </div>

      <ProductForm initialData={formattedProduct} />
    </div>
  );
}
