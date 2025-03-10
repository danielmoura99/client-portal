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

  return <div className="p-6 space-y-6"> EM DESENVOLVIMENTO</div>;
}
