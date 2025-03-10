// app/(admin)/admin/contents/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ContentForm } from "../_components/content-form";

export default async function NewContentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Buscar produtos para o seletor
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Buscar módulos para o seletor (opcional)
  const modules = await prisma.module.findMany({
    orderBy: { title: "asc" },
    include: { product: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/admin/contents">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Conteúdos
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white mb-2">Novo Conteúdo</h1>
        <p className="text-zinc-400">Adicione um novo arquivo ou conteúdo</p>
      </div>

      <ContentForm products={products} modules={modules} />
    </div>
  );
}
