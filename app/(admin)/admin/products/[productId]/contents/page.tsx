// app/(admin)/admin/products/[productId]/contents/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import ProductContentsClientPage from "./client-page";

interface PageProps {
  params: {
    productId: string;
  };
}

export default async function ProductContentsPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/admin");
  }

  // Buscar o produto com seus conteúdos
  const product = await prisma.product.findUnique({
    where: { id: params.productId },
    include: {
      contents: {
        include: {
          module: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
      modules: {
        orderBy: {
          sortOrder: "asc",
        },
        include: {
          _count: {
            select: { contents: true },
          },
        },
      },
    },
  });

  if (!product) {
    notFound();
  }

  return (
    <ProductContentsClientPage
      productId={params.productId}
      initialProduct={product}
    />
  );
}
