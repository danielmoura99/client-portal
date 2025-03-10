// app/(admin)/admin/users/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import UserTable from "./_components/user-table";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Buscar usuários com suas assinaturas (produtos)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      document: true,
      role: true,
      createdAt: true,
      products: {
        include: {
          product: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Usuários</h1>
          <p className="text-zinc-400">Gerencie os usuários e seus acessos</p>
        </div>

        <Button asChild>
          <Link href="/admin/users/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Usuário
          </Link>
        </Button>
      </div>

      <UserTable initialUsers={users} />
    </div>
  );
}
