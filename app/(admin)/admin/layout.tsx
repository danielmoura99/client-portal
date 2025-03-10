// app/(admin)/admin/layout.tsx
import "@/app/globals.css";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Image from "next/image";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Verificar se o usuário é admin
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      {/* Sidebar */}
      <AdminSidebar className="fixed rounded-2xl left-0 w-64 h-screen z-30 bg-zinc-900/95 border-r border-zinc-800" />

      {/* Main Content */}
      <main className="flex-1 rounded-2xl pl-6">
        {/* Header */}
        <div className="sticky top-0 z-20  flex h-16 items-center gap-4 border-b border-zinc-800 bg-background bg-black px-4">
          <Image src="/logo.png" width={130} height={30} alt="Logo" />
          <span className="text-zinc-300">Painel Administrativo</span>
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb />
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
