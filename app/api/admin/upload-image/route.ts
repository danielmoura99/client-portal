// app/api/admin/upload-image/route.ts
import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      return Response.json({ error: "Não autorizado" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return Response.json(
        { error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Validar se é uma imagem
    if (!file.type.startsWith("image/")) {
      return Response.json(
        { error: "O arquivo deve ser uma imagem" },
        { status: 400 }
      );
    }

    // Limite de 5MB para imagens
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: "Imagem deve ter no máximo 5MB" },
        { status: 400 }
      );
    }

    // Sanitizar filename: remover caracteres especiais e espaços
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
    const fileName = `course-covers/${Date.now()}-${safeName}`;

    // Fazer upload para o Vercel Blob
    const { url } = await put(fileName, file, {
      access: "public",
    });

    return Response.json({ url });
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    return Response.json(
      { error: "Erro ao processar o upload" },
      { status: 500 }
    );
  }
}
