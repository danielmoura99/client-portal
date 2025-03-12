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
  params: Promise<{ [contentId: string]: string }>;
}

export default async function EditContentPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await params;

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Buscar o conteúdo
  const content = await prisma.content.findUnique({
    where: { id: resolvedParams.contentId },
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

  // Buscar produtos para o formulário
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Determinar o produto principal
  const primaryProductContent = content.productContents[0] || null;
  const primaryProductId = primaryProductContent?.productId || "";

  // Buscar módulos relevantes
  const modules = await prisma.module.findMany({
    where: primaryProductId ? { productId: primaryProductId } : undefined,
    orderBy: { title: "asc" },
  });

  // Determinar para onde voltar
  const backUrl = "/admin/contents";

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href={backUrl}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conteúdos
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
          productId: primaryProductId,
          moduleId: primaryProductContent?.moduleId || "",
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
