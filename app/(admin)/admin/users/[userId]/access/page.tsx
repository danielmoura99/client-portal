// app/(admin)/admin/users/[userId]/access/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { UserAccessManager } from "./_components/user-access-managert";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserAccessPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }
  const resolvedParams = await params;
  // Buscar o usuário com seus produtos atribuídos
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Buscar todos os produtos disponíveis
  const allProducts = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  // Identificar produtos atribuídos e não atribuídos
  const assignedProductIds = user.products.map((up) => up.productId);

  const assignedProducts = user.products.map((up) => up.product);

  const unassignedProducts = allProducts.filter(
    (product) => !assignedProductIds.includes(product.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button asChild variant="ghost" size="sm" className="mb-2">
            <Link href="/admin/users">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar para Usuários
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-white">Gerenciar Acessos</h1>
          <p className="text-zinc-400 mt-1">
            {user.name} ({user.email})
          </p>
        </div>
      </div>

      <UserAccessManager
        user={user}
        assignedProducts={assignedProducts}
        unassignedProducts={unassignedProducts}
      />
    </div>
  );
}
