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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-100">
          Planilhas de Aprovação
        </h1>
        <p className="text-zinc-400">
          Ferramentas para acompanhar seus resultados e aumentar suas chances de
          aprovação.
        </p>
      </div>

      {accessiblePlanilhas.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-2">
            Acesso Restrito
          </h2>
          <p className="text-zinc-400">
            Para acessar as planilhas de aprovação, você precisa adquirir uma de
            nossas avaliações ou pacotes que incluem estas ferramentas.
          </p>

          <Button className="mt-4" asChild>
            <a
              href="https://tradershouse.com.br/mesaproprietaria"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver Opções Disponíveis
            </a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accessiblePlanilhas.map((planilha) => (
            <ToolCard
              key={planilha.id}
              title={planilha.name}
              description={planilha.description}
              contents={planilha.contents}
            />
          ))}
        </div>
      )}
    </div>
  );
}
