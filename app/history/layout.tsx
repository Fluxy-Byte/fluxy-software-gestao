"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { downloadHistoryCSV } from "@/app/history/export-history-csv";
import { useHistory } from "@/app/services/hiostory.swr";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { history } = useHistory();

  return (
    <AuthProvider>
      <SidebarProvider>

        <div className="flex h-screen w-full">

          {/* Sidebar */}
          <AppSidebar />

          {/* Conteúdo */}
          <main className="flex-1 flex flex-col overflow-hidden">

            {/* Header fixo */}
            <div className="border-b flex px-2 h-22 bg-background gap-4 shrink-0">

              <div className="flex h-full items-center">
                <SidebarTrigger />
              </div>

              <div className="flex justify-between w-full">

                <span className="h-full flex flex-col gap-1 items-start justify-center">
                  <h1 className="text-base md:text-2xl font-semibold">
                    Histórico de Ações do Sistema
                  </h1>
                  <p className="text-sm hidden md:block">
                    Visualize todas as ações realizadas na plataforma
                  </p>
                </span>

                <div className="flex items-center justify-center gap-3 pr-3">
                  <Button size={"commum"} variant={"default"} onClick={() => downloadHistoryCSV(history)}>
                    <Download /> Exportar CSV
                  </Button>
                </div>

              </div>
            </div>

            {/* Conteúdo com scroll */}
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>

          </main>
        </div>

        <Toaster />
      </SidebarProvider>
    </AuthProvider>
  )
}