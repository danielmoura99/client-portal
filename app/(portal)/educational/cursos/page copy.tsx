// app/(portal)/educational/cursos/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getUserProducts } from "@/lib/services/access-control";
import { CourseCard } from "../_components/course-card";
import { ProductType } from "@prisma/client";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Buscar produtos do tipo COURSE que o usuário tem acesso
  const userProducts = await getUserProducts(session.user.id);

  // Filtrar apenas os cursos
  const courses = userProducts
    .filter((up) => up.product.type === ProductType.COURSE)
    .map((up) => up.product);

  // Buscar cursos disponíveis para compra (para possível exibição de ofertas)
  const availableCourses = await prisma.product.findMany({
    where: {
      type: ProductType.COURSE,
      NOT: {
        id: {
          in: courses.map((c) => c.id),
        },
      },
    },
    take: 3,
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-100">Meus Cursos</h1>
        <p className="text-zinc-400">
          Acesse os cursos disponíveis em sua conta
        </p>
      </div>

      {courses.length === 0 ? (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
          <h2 className="text-lg font-medium text-zinc-100 mb-2">
            Você ainda não possui cursos
          </h2>
          <p className="text-zinc-400">
            Adquira um de nossos cursos para acelerar seu desenvolvimento como
            trader.
          </p>

          {availableCourses.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium text-zinc-100 mb-4">
                Cursos disponíveis para você:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isPurchased={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} isPurchased={true} />
          ))}
        </div>
      )}
    </div>
  );
}
