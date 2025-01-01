// app/api/auth/forgot-password/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import crypto from "crypto";
import { sendPasswordResetEmail, verifyEmailConfig } from "@/lib/email-service";

export async function POST(req: NextRequest) {
  try {
    const isEmailConfigValid = await verifyEmailConfig();
    if (!isEmailConfigValid) {
      return Response.json(
        { error: "Erro na configuração de email" },
        { status: 500 }
      );
    }

    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return Response.json({
        message:
          "Se o email estiver cadastrado, você receberá as instruções de recuperação.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hora

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/redefinir-senha/${resetToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      userName: user.name,
      resetUrl,
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
