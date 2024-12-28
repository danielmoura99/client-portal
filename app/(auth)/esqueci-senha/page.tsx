// client-portal/app/(auth)/esqueci-senha/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email");

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao enviar email");
      }

      setEmailSent(true);
      toast({
        title: "Email enviado",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao enviar email",
        description: error instanceof Error ? error.message : "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <Mail className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-zinc-100 mb-2">
              Esqueceu sua senha?
            </h1>
            <p className="text-zinc-400 text-sm">
              Digite seu email para receber instruções de recuperação
            </p>
          </div>

          {emailSent ? (
            <div className="text-center space-y-4">
              <p className="text-green-500">Email enviado com sucesso!</p>
              <p className="text-sm text-zinc-400">
                Verifique sua caixa de entrada e siga as instruções para
                redefinir sua senha.
              </p>
              <Button variant="outline" onClick={() => setEmailSent(false)}>
                Enviar novamente
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-400">Email</label>
                <Input
                  type="email"
                  name="email"
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Digite seu email"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar Email"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
