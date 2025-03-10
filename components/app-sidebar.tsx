"use client";

import * as React from "react";
import { BookOpen, ChevronUp, UserRound } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Menu de Navegacão",
      url: "",
      icon: UserRound,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Avaliações",
          url: "/evaluations",
        },
        {
          title: "Perfil",
          url: "/profile",
        },
        {
          title: "Solicitações",
          url: "/requests",
        },
      ],
    },
    {
      title: "Educacional",
      url: "",
      icon: BookOpen,
      isActive: true,
      items: [
        {
          title: "Tutoriais",
          url: "/educational",
        },
        {
          title: "Cursos",
          url: "/educational/cursos",
        },
        {
          title: "Planilha de Aprovação",
          url: "/educational/planilha-aprovacao",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ChevronUp className="size-14" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Traders House</span>
                  <span className="truncate text-xs">Painel</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
