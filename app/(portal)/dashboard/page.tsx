// app/(portal)/dashboard/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    console.log("Dashboard - Session Status:", status);
    console.log("Dashboard - Session:", !!session);

    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-zinc-400">Carregando...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">
          Bem-vindo(a), {session.user?.name}
        </h2>
        <p className="text-zinc-400">
          Aqui você pode acompanhar suas avaliações e fazer solicitações.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Avaliações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Visualize e acompanhe suas avaliações em andamento.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Solicitações</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">
              Faça novas solicitações ou acompanhe as existentes.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-zinc-400">Atualize suas informações pessoais.</p>
            <Button>teste</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
