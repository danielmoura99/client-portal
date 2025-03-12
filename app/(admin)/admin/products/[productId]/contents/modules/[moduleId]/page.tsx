// app/(admin)/admin/products/[productId]/contents/modules/[moduleId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ModuleForm } from "../_components/module-form";

interface PageProps {
  params: Promise<{
    productId: string;
    moduleId: string;
  }>;
}

//params: Promise<{ [productId: string]: string }>;

export default async function EditModulePage({ params }: PageProps) {
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

  // Buscar o módulo (precisa renomear esta variável)
  const moduleItem = await prisma.module.findUnique({
    where: { id: resolvedSearchParams.moduleId },
  });

  if (!moduleItem) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link
            href={`/admin/products/${resolvedSearchParams.productId}/contents`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conteúdos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white mb-2">Editar Módulo</h1>
        <p className="text-zinc-400">
          {moduleItem.title} - {product.name}
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 max-w-md">
        <ModuleForm
          productId={resolvedSearchParams.productId}
          initialData={moduleItem}
        />
      </div>
    </div>
  );
}
