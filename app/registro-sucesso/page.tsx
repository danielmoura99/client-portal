// client-portal/app/registro-sucesso/page.tsx
"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, KeyRound } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { toast } from "@/hooks/use-toast";

function RegistroSucessoContent() {
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("new") === "true";
  const password = searchParams.get("password");

  const copyPassword = () => {
    if (password) {
      navigator.clipboard.writeText(password);
      setCopied(true);
      toast({
        description: "Senha copiada para a área de transferência",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-zinc-100 mb-2">
              Registro Concluído com Sucesso!
            </h1>
            <p className="text-zinc-400 mb-6">
              {isNewUser
                ? "Sua conta foi criada e sua avaliação está registrada."
                : "Sua nova avaliação foi registrada com sucesso."}
            </p>
          </div>

          {isNewUser && password && (
            <div className="bg-zinc-800 p-4 rounded-lg border border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-zinc-300">
                    Sua senha inicial
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyPassword}
                  className="h-8 px-2"
                >
                  <Copy
                    className={`w-4 h-4 ${
                      copied ? "text-green-500" : "text-zinc-400"
                    }`}
                  />
                </Button>
              </div>
              <p className="text-lg font-mono text-center bg-zinc-900 py-2 rounded">
                {password}
              </p>
              <p className="text-xs text-zinc-400 text-center">
                Por segurança, você deverá alterar esta senha no primeiro
                acesso.
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/login">Ir para Login</Link>
            </Button>
            {isNewUser && (
              <p className="text-xs text-center text-zinc-500">
                Guarde sua senha inicial. Você precisará dela para seu primeiro
                acesso.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RegistroSucessoPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
          <p className="text-zinc-400">Carregando...</p>
        </div>
      }
    >
      <RegistroSucessoContent />
    </Suspense>
  );
}
