// app/(portal)/educational/cursos/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserProducts } from "@/lib/services/access-control";
import { CourseCard } from "../_components/course-card";
import { ProductType } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar produtos do tipo COURSE que o usuário tem acesso
  const userProducts = await getUserProducts(session.user.id);

  // Filtrar apenas os cursos
  const userCourses = userProducts
    .filter((up) => up.product.type === ProductType.COURSE)
    .map((up) => ({
      ...up.product,
      coverImage: up.product.coverImage,
    }));
  // Buscar cursos em destaque para exibir na vitrine
  // Você pode ajustar a query conforme necessário para selecionar os cursos que deseja destacar
  // Por exemplo, adicionar uma coluna "featured" na tabela Product e filtrar por ela
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const featuredCourses = await prisma.product.findMany({
    where: {
      type: ProductType.COURSE,
      // Opcional: filtrar apenas cursos ativos ou em destaque, se você tiver esse campo
      // featured: true,
    },
    take: 3, // Limite de cursos para exibir na vitrine
  });

  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-100">Meus Cursos</h1>
        <p className="text-zinc-400">
          Acesse os cursos disponíveis em sua conta
        </p>
      </div>

      {/* Seção de Cursos do Usuário */}
      <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
        <CardContent className="p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-4">
            Seus Cursos
          </h2>

          {userCourses.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-zinc-400">
                Você ainda não possui cursos adquiridos.
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                Confira abaixo os cursos disponíveis para acelerar seu
                desenvolvimento.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap  gap-8">
              {userCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isPurchased={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitrine de Cursos 
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Vitrine de Cursos
        </h2>
        <Card className="bg-zinc-900/50 border border-zinc-800 rounded-lg overflow-hidden">
          <CardContent className="p-6">
            <div className="mb-4">
              <p className="text-zinc-400">
                Conheça nossos cursos exclusivos para traders e acelere sua
                jornada no mundo do trading.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isPurchased={userCourses.some((c) => c.id === course.id)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>*/}
    </div>
  );
}
