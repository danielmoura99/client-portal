// components/admin-sidebar.tsx
"use client";

import * as React from "react";
import { Users, Book, Home, FileSpreadsheet, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  A
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Admin Panel</span>
                  <span className="truncate text-xs">Traders House</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="py-2">
        {" "}
        {/* Reduzindo o padding vertical */}
        <SidebarMenu className="space-y-1">
          {" "}
          {/* Reduzindo o espaço entre items */}
          <SidebarMenuItem>
            <Link href="/admin" passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname === "/admin"}
                className="pl-4" // Adicionando padding à esquerda para deslocar para direita
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/users" passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname.startsWith("/admin/users")}
                className="pl-4" // Adicionando padding à esquerda para deslocar para direita
              >
                <Users className="h-4 w-4" />
                <span>Usuários</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/products" passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname.startsWith("/admin/products")}
                className="pl-4" // Adicionando padding à esquerda para deslocar para direita
              >
                <Book className="h-4 w-4" />
                <span>Produtos</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Link href="/admin/contents" passHref legacyBehavior>
              <SidebarMenuButton
                isActive={pathname.startsWith("/admin/contents")}
                className="pl-4" // Adicionando padding à esquerda para deslocar para direita
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Conteúdos</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="pl-4" // Adicionando padding à esquerda para deslocar para direita
            >
              <LogOut className="h-4 w-4" />
              <span>Sair</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
