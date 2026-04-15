"use client"

import {
  TicketCheck,
  ArrowLeftRight,
  Briefcase,
  Users,
  FileText,
  LogOut,
  User,
  Building2,
} from "lucide-react";

import Link from "next/link";

import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";


import { authClient, useSession } from "@/lib/auth/auth-client";

import { Button } from "@/components/ui/button";

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/login")
  }

  const menuItems = session?.user.role === "admin" ?
    [
      {
        title: "Transferência de Tickets",
        url: "/tickets",
        icon: ArrowLeftRight,
      },
      {
        title: "Gerenciar Builders",
        url: "/builders",
        icon: Briefcase,
      },
      {
        title: "Gerenciar Usuários",
        url: "/users",
        icon: Users,
      },
      {
        title: "Histórico de Ações",
        url: "/history",
        icon: FileText,
      },
    ]
    :
    [
      {
        title: "Transferência de Tickets",
        url: "/tickets",
        icon: ArrowLeftRight,
      },
      {
        title: "Histórico de Ações",
        url: "/history",
        icon: FileText,
      },
    ]

  return (
    <Sidebar >
      <SidebarHeader className="border-b bg-white px-2 h-22">
        <div className="h-full w-full flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <TicketCheck />
          </div>
          <div>
            <p className="text-base font-semibold">Telek Sistemas</p>
            <p className="text-sm text-muted-foreground">Mass Tickets</p>
          </div>

        </div>
      </SidebarHeader>

      <SidebarContent className="bg-white">
        <SidebarGroup>
          <SidebarGroupContent className="mt-3">
            <SidebarMenu className="px-2">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    className={
                      pathname === item.url
                        ? "bg-primary/18 text-primary flex items-center gap-3 py-5"
                        : "hover:bg-primary/8 flex items-center gap-3 py-6"
                    }
                  >
                    <Link href={item.url}>
                      <item.icon size={22} />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t bg-white py-6 px-9 gap-4">
        <div className="flex items-center gap-3">
          <User size={22} />
          <div className="flex flex-col text-left">
            <span className="text-base font-medium">
              {session?.user?.name || "Usuário"}
            </span>
            <span className="text-sm font-light text-muted-foreground">
              {session?.user?.email}
            </span>
          </div>
        </div>

        <Button
          variant={"ghost"}
          onClick={handleLogout}
          className="flex items-center gap-3 justify-start"
        >
          <LogOut size={22} />
          <span>Sair</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}