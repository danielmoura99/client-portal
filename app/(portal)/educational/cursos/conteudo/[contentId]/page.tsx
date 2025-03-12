// app/(portal)/educational/cursos/conteudo/[contentId]/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkUserAccess } from "@/lib/services/access-control";

interface ContentPageProps {
  params: {
    contentId: string;
  };
}

export default async function ContentRedirectPage({
  params,
}: ContentPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar o conteúdo solicitado com seu relacionamento ao produto através da tabela ProductContent
  const contentWithProductRelation = await prisma.content.findUnique({
    where: { id: params.contentId },
    include: {
      productContents: {
        include: {
          product: true,
        },
        take: 1, // Pegamos o primeiro relacionamento para referência
      },
    },
  });

  if (
    !contentWithProductRelation ||
    contentWithProductRelation.productContents.length === 0
  ) {
    notFound();
  }

  // Extrair informações do primeiro relacionamento de produto
  const firstProductContent = contentWithProductRelation.productContents[0];
  const product = firstProductContent.product;

  // Verificar acesso do usuário ao conteúdo
  const hasAccess = await checkUserAccess(session.user.id, {
    contentId: params.contentId,
  });

  if (!hasAccess) {
    redirect("/educational/cursos");
  }

  // Redirecionar para a página do curso com o conteúdo específico
  redirect(`/educational/cursos/${product.slug}?content=${params.contentId}`);
}
