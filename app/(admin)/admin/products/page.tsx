// app/(admin)/admin/products/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ProductTable from "./_components/product-table";
import { redirect } from "next/navigation";

export default async function AdminProductsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Buscar todos os produtos
  const products = await prisma.product.findMany({
    include: {
      _count: {
        select: {
          contents: true,
          userProducts: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Produtos</h1>
          <p className="text-zinc-400">
            Gerencie cursos e ferramentas do sistema
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/products/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Produto
          </Link>
        </Button>
      </div>

      <ProductTable initialProducts={products} />
    </div>
  );
}
