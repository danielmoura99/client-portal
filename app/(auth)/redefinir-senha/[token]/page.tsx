// app/(auth)/redefinir-senha/[token]/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const resetSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "As senhas não conferem",
    path: ["confirm"],
  });

export default function ResetPasswordPage({
  params,
}: {
  params: { token: string };
}) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        password: formData.get("password") as string,
        confirm: formData.get("confirm") as string,
      };

      const validated = resetSchema.parse(data);

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: params.token,
          password: validated.password,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao redefinir senha");
      }

      toast({
        title: "Senha redefinida com sucesso",
        description: "Você já pode fazer login com sua nova senha.",
      });

      router.push("/login");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao redefinir senha",
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
            <h1 className="text-xl font-semibold text-zinc-100 mb-2">
              Redefinir Senha
            </h1>
            <p className="text-zinc-400 text-sm">
              Digite sua nova senha abaixo
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Nova Senha</label>
              <Input
                type="password"
                name="password"
                className="bg-zinc-800 border-zinc-700"
                placeholder="Digite sua nova senha"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Confirmar Senha</label>
              <Input
                type="password"
                name="confirm"
                className="bg-zinc-800 border-zinc-700"
                placeholder="Confirme sua nova senha"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
