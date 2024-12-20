// app/(portal)/layout.tsx
import "@/app/globals.css";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { UserNav } from "./dashboard/_components/user-nav"; // Ajustado o caminho
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Importar authOptions

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  console.log("Portal Layout - Session:", !!session); // log seguro

  if (!session) {
    console.log("No session in Portal Layout, redirecting to login");
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-zinc-100">
              Portal do Cliente
            </h1>
            <UserNav />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
    </div>
  );
}
