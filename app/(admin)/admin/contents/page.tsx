// app/(admin)/admin/contents/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import ContentTable from "./_components/content-table";

export default async function AdminContentsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Buscar todos os conteúdos com seus produtos relacionados
  const contents = await prisma.content.findMany({
    include: {
      product: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Conteúdos</h1>
          <p className="text-zinc-400">
            Gerencie arquivos, vídeos e outros conteúdos
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/contents/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Novo Conteúdo
          </Link>
        </Button>
      </div>

      <ContentTable initialContents={contents} />
    </div>
  );
}
