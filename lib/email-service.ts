// lib/email-service.ts
import { render } from "@react-email/render";
import nodemailer, { TransportOptions } from "nodemailer";
import ResetPasswordEmail from "@/app/emails/reset-password";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
} as TransportOptions);

interface SendEmailParams {
  to: string;
  userName: string;
  resetUrl: string;
}

export async function verifyEmailConfig() {
  try {
    await transporter.verify();
    console.log("Configuração de email verificada com sucesso");
    return true;
  } catch (error) {
    console.error("Erro na configuração de email:", error);
    return false;
  }
}

export async function sendPasswordResetEmail({
  to,
  userName,
  resetUrl,
}: SendEmailParams) {
  try {
    const html = await render(ResetPasswordEmail({ userName, resetUrl }));

    const info = await transporter.sendMail({
      from:
        process.env.EMAIL_FROM ||
        '"Mesa Proprietária" <noreply@seudominio.com>',
      to,
      subject: "Recuperação de Senha - Traders House",
      html,
    });

    return { success: true, messageId: info.messageId as string };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    throw error;
  }
}
