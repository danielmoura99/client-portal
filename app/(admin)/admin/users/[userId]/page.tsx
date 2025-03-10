// app/(admin)/admin/users/[userId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { UserForm } from "./_components/user-form";

interface PageProps {
  params: {
    userId: string;
  };
}

export default async function EditUserPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Buscar o usuário
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: {
      id: true,
      name: true,
      email: true,
      document: true,
      phone: true,
      address: true,
      zipCode: true,
      role: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="mb-2">
          <Link href="/admin/users">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Voltar para Usuários
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-white mb-2">Editar Usuário</h1>
        <p className="text-zinc-400">
          {user.name} ({user.email})
        </p>
      </div>

      {/* Formulário de edição */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <UserForm initialData={user} />
      </div>
    </div>
  );
}
