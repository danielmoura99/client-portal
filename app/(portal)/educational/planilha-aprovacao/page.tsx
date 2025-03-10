// app/(portal)/educational/planilha-aprovacao/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { checkUserAccess } from "@/lib/services/access-control";
import { ToolCard } from "../_components/tool-card";
import { Button } from "@/components/ui/button";

export default async function PlanilhaAprovacaoPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Verificar se o usuário tem acesso a ferramentas do tipo TOOL
  const hasAccess = await checkUserAccess(session.user.id, {
    productType: "TOOL",
  });

  // Buscar todas as ferramentas do tipo planilha
  const planilhas = await prisma.product.findMany({
    where: {
      type: "TOOL",
      slug: { startsWith: "planilha-" },
    },
    include: {
      contents: {
        where: { type: "file" },
      },
    },
  });

  // Filtrar apenas as planilhas às quais o usuário tem acesso
  const accessiblePlanilhas = [];

  if (hasAccess) {
    for (const planilha of planilhas) {
      const userHasAccess = await checkUserAccess(session.user.id, {
        productSlug: planilha.slug,
      });

      if (userHasAccess) {
        accessiblePlanilhas.push(planilha);
      }
    }
  }

  return <div className="p-6 space-y-6">EM DESENVOLVIMENTO</div>;
}
