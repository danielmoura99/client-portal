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

    // Gerar um nome único para o arquivo
    const fileName = `course-covers/${Date.now()}-${file.name}`;

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
