"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import axios from "axios";
import { useBuilders } from "@/app/services/builders.swr";
import { ToastPersonalizado } from "@/components/toast";
import {
  Building2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
interface ResultCreateOrganization {
  status: boolean,
  organization: any | null,
  message: string
}

const builderSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  tokenBuilder: z.string().min(3, "Token Builder inválido"),
  tokenRooter: z.string().min(3, "Token Router inválido"),
  url: z.string().min(3, "URL inválida"),
});

type BuilderFormData = z.infer<typeof builderSchema>;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [nameBuilder, setNameBuilder] = useState<string>("");
  const [tokenBuilder, setTokenBuilder] = useState<string>("");
  const [tokenRooter, setTokenRooter] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const { refresh } = useBuilders();
  async function postBuilder() {
    try {
      const formData: BuilderFormData = {
        name: nameBuilder,
        tokenBuilder,
        tokenRooter,
        url,
      };

      const validation = builderSchema.safeParse(formData);

      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          ToastPersonalizado({
            message: issue.message,
            type: "erro",
          });
        });

        return;
      }

      const { data } = await axios.post(`/api/builders`,
        validation.data,
        {
          headers: {
            withCredentials: true
          }
        }
      );

      const body: ResultCreateOrganization = data;

      if (body.status == true) {
        ToastPersonalizado({ message: "Sucesso na criação da organização" });
        setUrl("")
        setTokenRooter("")
        setTokenBuilder("")
        setNameBuilder("")
        return;

      } else {
        ToastPersonalizado({ message: body.message ?? "Tivemos um erro inesperado, por gentileza contate um suporte!", type: "erro" })
        return
      }
    } catch (e) {
      console.error(e);
      ToastPersonalizado({ message: "Tivemos um erro inesperado, por gentileza contate um suporte!", type: "erro" })
    } finally {
      refresh();
    }
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="border-b flex px-2 h-22 bg-background gap-4 shrink-0">
              <div className="flex h-full items-center">
                <SidebarTrigger />
              </div>

              <div className="flex justify-between w-full">

                <span className="h-full flex flex-col gap-1 items-start justify-center">
                  <h1 className="text-base md:text-2xl font-semibold">
                    Gerenciar Builders
                  </h1>
                  <p className="text-sm hidden md:block">
                    Cadastre e gerencie os builders da plataforma
                  </p>
                </span>

                <div className="flex items-center justify-center gap-3 pr-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="default" size={"commum"}><Plus /> Novo Builder</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="mb-1 font-bold flex items-center gap-2 text-primary"><Building2 /> Nova organização</AlertDialogTitle>
                        <AlertDialogDescription className="w-full flex flex-col gap-3">
                          <Label htmlFor="nameBuilder" className="font-normal">
                            Nome da organização
                          </Label>
                          <Input onChange={(e) => setNameBuilder(e.target.value)} id="nameBuilder" type="text" className="w-full" placeholder="Telek" />

                          <Label htmlFor="tokenBuilder" className="font-normal">
                            Token do Builder
                          </Label>
                          <Input onChange={(e) => setTokenBuilder(e.target.value)} id="tokenBuilder" type="text" className="w-full" placeholder="Key dwadawdad242432..." />

                          <Label htmlFor="tokenRooter" className="font-normal">
                            Token do Rooter
                          </Label>
                          <Input onChange={(e) => setTokenRooter(e.target.value)} id="tokenRooter" type="text" className="w-full" placeholder="Key dwadawdad242432..." />

                          <Label htmlFor="url" className="font-normal">
                            URL de conexão
                          </Label>
                          <Input onChange={(e) => setUrl(e.target.value)} id="url" type="text" className="w-full" placeholder="WWW.EXEMPLO.COM.BR" />
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={
                            !nameBuilder ||
                            !tokenBuilder ||
                            !tokenRooter ||
                            !url
                          }
                          onClick={() => postBuilder()}>Criar Organização
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
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
      </SidebarProvider >
    </AuthProvider >
  )
}