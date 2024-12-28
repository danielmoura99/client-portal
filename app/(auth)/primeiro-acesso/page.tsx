// client-portal/app/(auth)/primeiro-acesso/page.tsx
"use client";

import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const passwordSchema = z
  .object({
    current: z.string().min(4, "Senha atual é obrigatória"),
    new: z.string().min(6, "Nova senha deve ter no mínimo 6 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.new === data.confirm, {
    message: "Senhas não conferem",
    path: ["confirm"],
  });

export default function PrimeiroAcessoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        current: formData.get("current") as string,
        new: formData.get("new") as string,
        confirm: formData.get("confirm") as string,
      };

      const validated = passwordSchema.parse(data);

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validated),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Erro ao alterar senha");
      }

      toast({
        title: "Senha alterada com sucesso",
        description: "Você pode fazer login com sua nova senha agora.",
      });

      router.push("/login");
    } catch (error) {
      console.error(error);
      toast({
        title: "Erro ao alterar senha",
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
              Primeiro Acesso
            </h1>
            <p className="text-zinc-400 text-sm">
              Por favor, altere sua senha para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Senha Atual</label>
              <Input
                type="password"
                name="current"
                className="bg-zinc-800 border-zinc-700"
                placeholder="Digite sua senha atual"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Nova Senha</label>
              <Input
                type="password"
                name="new"
                className="bg-zinc-800 border-zinc-700"
                placeholder="Digite sua nova senha"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-zinc-400">
                Confirmar Nova Senha
              </label>
              <Input
                type="password"
                name="confirm"
                className="bg-zinc-800 border-zinc-700"
                placeholder="Confirme sua nova senha"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
