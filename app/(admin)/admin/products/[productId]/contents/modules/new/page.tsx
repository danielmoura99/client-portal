// app/(admin)/admin/products/[productId]/contents/modules/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ModuleForm } from "../_components/module-form";

interface PageProps {
  params: {
    productId: string;
  };
}

export default async function NewModulePage({ params }: PageProps) {
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
          <Link href={`/admin/products/${params.productId}/contents`}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conteúdos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white mb-2">Novo Módulo</h1>
        <p className="text-zinc-400">
          Adicionar módulo ao produto: {product.name}
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6 max-w-md">
        <ModuleForm productId={params.productId} />
      </div>
    </div>
  );
}
