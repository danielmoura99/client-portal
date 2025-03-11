// app/api/admin/contents/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { mkdir } from "fs/promises";

// Função auxiliar para salvar arquivo
async function saveFile(file: File, destPath: string): Promise<string> {
  // Garantir que o diretório existe
  const dir = path.dirname(destPath);
  await mkdir(dir, { recursive: true });

  // Ler o arquivo como um array de bytes
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Escrever o arquivo no sistema
  await fs.promises.writeFile(destPath, buffer);

  return destPath;
}

export async function POST(req: NextRequest) {
  // Verificar autenticação
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Processar formulário com upload de arquivo
    const formData = await req.formData();

    // Extrair dados do formulário
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const type = formData.get("type") as string;
    const productId = formData.get("productId") as string;
    const moduleId = formData.get("moduleId") as string | null;
    const finalModuleId =
      moduleId === "none" || moduleId === "" ? null : moduleId;
    let filePath = formData.get("path") as string;
    const sortOrder = Number(formData.get("sortOrder") || 0);

    // Validar dados essenciais
    if (!title || !type || !productId) {
      return Response.json(
        { error: "Dados obrigatórios não fornecidos" },
        { status: 400 }
      );
    }

    // Processar arquivo, se fornecido
    const file = formData.get("file") as File | null;

    if (file) {
      // Criar estrutura de diretório
      const baseDir = process.env.CONTENTS_DIR || "contents";
      // Remover a variável productDir que não é usada

      // Garantir que o caminho está no formato esperado
      if (!filePath || !filePath.startsWith(baseDir)) {
        filePath = `${baseDir}/${productId}/${file.name}`;
      }

      // Caminho absoluto para salvar o arquivo
      // Corrigir o erro com path.join usando o path do Node.js
      const absolutePath = path.join(process.cwd(), filePath);

      // Salvar o arquivo
      await saveFile(file, absolutePath);
    }

    // Criar entrada no banco de dados
    const content = await prisma.content.create({
      data: {
        title,
        description,
        type,
        path: filePath, // Usar filePath em vez de path para evitar confusão
        productId,
        moduleId: finalModuleId, // Use finalModuleId aqui
        sortOrder, // Adicione o sortOrder aqui
      },
    });

    return Response.json({ success: true, content });
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 }
    );
  }
}
