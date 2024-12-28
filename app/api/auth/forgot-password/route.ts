// app/api/auth/forgot-password/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Por segurança, retornamos a mesma mensagem mesmo se o usuário não existir
    if (!user) {
      return Response.json({
        message:
          "Se o email estiver cadastrado, você receberá as instruções de recuperação.",
      });
    }

    // Gerar token e data de expiração
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    // Atualizar usuário com o token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Enviar email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/redefinir-senha/${resetToken}`;

    await resend.emails.send({
      from: "noreply@seudominio.com",
      to: user.email,
      subject: "Recuperação de Senha",
      html: `
        <div style="font-family: sans-serif; color: #333;">
          <h2>Recuperação de Senha</h2>
          <p>Você solicitou a recuperação de senha da sua conta.</p>
          <p>Clique no link abaixo para redefinir sua senha:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Redefinir Senha
          </a>
          <p>Este link é válido por 1 hora.</p>
          <p>Se você não solicitou esta recuperação, ignore este email.</p>
        </div>
      `,
    });

    return Response.json({
      message:
        "Se o email estiver cadastrado, você receberá as instruções de recuperação.",
    });
  } catch (error) {
    console.error("[Forgot Password] Error:", error);
    return Response.json(
      { error: "Erro ao processar solicitação" },
      { status: 500 }
    );
  }
}
