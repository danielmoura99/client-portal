// emails/reset-password.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  userName: string;
  resetUrl: string;
}

const styles = {
  main: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    padding: "40px 0",
    margin: "0 auto",
    width: "100%",
    maxWidth: "600px",
  },
  section: {
    backgroundColor: "#ffffff",
    padding: "32px",
    borderRadius: "8px",
    border: "1px solid #eaeaea",
  },
  heading: {
    fontSize: "24px",
    letterSpacing: "-0.5px",
    marginBottom: "24px",
    textAlign: "center" as const,
    color: "#1f2937",
  },
  text: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#4b5563",
    marginBottom: "16px",
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: "6px",
    color: "#fff",
    fontSize: "16px",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "100%",
    padding: "12px 0",
  },
  footer: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: "24px",
    textAlign: "center" as const,
  },
};

export const ResetPasswordEmail = ({
  userName,
  resetUrl,
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Recuperação de Senha - Portal do Cliente Traders House</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.section}>
          <Heading style={styles.heading}>Traders House</Heading>
          <Text style={styles.text}>Olá {userName},</Text>
          <Text style={styles.text}>
            Você solicitou a recuperação de senha da sua conta.
          </Text>
          <Button href={resetUrl} style={styles.button}>
            Redefinir Senha
          </Button>
          <Text style={styles.footer}>
            Este link é válido por 1 hora. Se você não solicitou esta
            recuperação, ignore este email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ResetPasswordEmail;
