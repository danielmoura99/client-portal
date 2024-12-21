// app/(portal)/layout.tsx
import "@/app/globals.css";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Importar authOptions
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import Image from "next/image";

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
    <SidebarProvider>
      {/* Sidebar */}
      <AppSidebar className="fixed rounded-2xl left-0 w-64 h-screen z-30 bg-zinc-900/95 border-r border-zinc-800 " />

      {/* Main Content */}
      <main className="flex-1 rounded-2xl pl-6">
        {/* Header */}
        <div className="sticky top-0 z-20  flex h-16 items-center gap-4 border-b border-zinc-800 bg-background bg-black px-4">
          <SidebarTrigger className="text-zinc-400 hover:text-zinc-100" />
          <Separator orientation="vertical" className="h-6" />
          <Image src="/logo.png" width={130} height={30} alt="Logo" />
          Portal do Cliente - Traders House
          <Breadcrumb />
        </div>

        {/* Content */}
        <div className="p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
