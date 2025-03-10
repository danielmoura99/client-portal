// app/(admin)/admin/users/new/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { NewUserForm } from "./_components/new-user-form";

export default async function NewUserPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
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
        <h1 className="text-2xl font-bold text-white mb-2">Novo Usuário</h1>
        <p className="text-zinc-400">Cadastre um novo usuário no sistema</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <NewUserForm />
      </div>
    </div>
  );
}
