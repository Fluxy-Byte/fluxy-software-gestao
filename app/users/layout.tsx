"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AuthProvider } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Eye, EyeClosed, Plus, Upload, User } from "lucide-react"
import { UserWithRelations } from "@/app/api/interfaces/user.interface";
import { useBuilders } from "@/app/services/builders.swr";
import { useUsers } from "@/app/services/users.swr";
import ImportCSVDialog from "@/app/users/importUsersCsv";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { z } from "zod";
import { ToastPersonalizado } from "@/components/toast";
import axios from "axios";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface ResultCreateUser {
  status: boolean,
  user: UserWithRelations
  message: string
}

const createUserSchema = z.object({
  nameUser: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  emailUser: z.string().min(3, "O e-mail deve ter no minimo 3 caracteres"),
  password: z.string().min(8, "É necessario que a senha do usuario tenha no minimo 8 caracteres"),
  role: z.string().min(3, "Tipo de perfil esta inválido")
});

type createUserForms = z.infer<typeof createUserSchema>;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [nameUser, setNameUser] = useState<string>("");
  const [emailUser, setEmailUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [buildersUser, setBuildersUser] = useState<string[]>([]);
  const [statusEye, setStatusEye] = useState<boolean>(false);
  const { builders } = useBuilders();
  const { refresh } = useUsers();

  async function postUser() {
    try {
      const payload: createUserForms = {
        nameUser,
        emailUser,
        password,
        role
      };

      const validation = createUserSchema.safeParse(payload);

      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          ToastPersonalizado({
            message: issue.message,
            type: "erro",
          });
        });
        return;
      }

      const { data } = await axios.post(
        "/api/users",
        {
          name: payload.nameUser,
          email: payload.emailUser,
          role: payload.role,
          password: payload.password,
          builderMemberships: buildersUser
        },
        {
          headers: {
            withCredentials: true
          }
        }
      )

      const result: ResultCreateUser = data;

      ToastPersonalizado({
        message: result.message,
        type: result.status ? "" : "erro",
      });

      if (result.status == true) {
        setRole("")
        setPassword("")
        setEmailUser("")
        setNameUser("")
      }

    } catch (e) {
      console.error(e)
      ToastPersonalizado({
        message:
          "Tivemos um erro inesperado, por gentileza contate um suporte!",
        type: "erro",
      });
    }
    finally {
      refresh();
    }
  }

  return (
    <AuthProvider>
      <SidebarProvider>

        <div className="flex h-screen w-full">

          {/* Sidebar */}
          <AppSidebar />

          {/* Conteúdo principal */}
          <main className="flex-1 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="border-b flex px-2 h-22 bg-background gap-4 shrink-0">

              <div className="flex h-full items-center">
                <SidebarTrigger />
              </div>

              <div className="flex justify-between w-full">

                <span className="h-full flex flex-col gap-1 items-start justify-center">
                  <h1 className="text-base md:text-2xl font-semibold">
                    Gerenciar Usuários
                  </h1>
                  <p className="text-sm hidden md:block">
                    Cadastre usuários e defina permissões de acesso
                  </p>
                </span>

                <div className="flex items-center justify-center gap-3 pr-3">
                  <ImportCSVDialog />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="commum"
                      >
                        <Plus /> Novo Usuário
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="mb-1 font-bold flex items-center gap-2 text-primary"><User />Criando usuário</AlertDialogTitle>
                        <AlertDialogDescription className="w-full flex flex-col gap-3">

                          <span className="grid gap-2">
                            <Label htmlFor="nameUser" className="font-normal">
                              Nome Completo
                            </Label>
                            <Input
                              id="nameUser"
                              value={nameUser}
                              onChange={(e) => setNameUser(e.target.value)}
                              type="text"
                              className="w-full"
                              placeholder="Telek"
                            />
                          </span>
                          <span className="grid gap-2">
                            <Label htmlFor="emailUser" className="font-normal">
                              E-mail Corporativo
                            </Label>
                            <Input
                              id="emailUser"
                              value={emailUser}
                              onChange={(e) => setEmailUser(e.target.value)}
                              type="text"
                              className="w-full"
                              placeholder="seu.nome@tahto.com.br"
                            />
                          </span>
                          <span className="grid gap-2">
                            <Label htmlFor="password" className="font-normal">
                              Senha
                            </Label>
                            <span className="w-full flex items-center relative">
                              <Input
                                type={statusEye ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                              // espaço pro ícone
                              />

                              {statusEye ? (
                                <EyeClosed
                                  onClick={() => setStatusEye(false)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-black transition"
                                  size={20}
                                />
                              ) : (
                                <Eye
                                  onClick={() => setStatusEye(true)}
                                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-black transition"
                                  size={20}
                                />
                              )}
                            </span>
                          </span>
                          <span className="grid gap-2">
                            <Label htmlFor="role" className="font-normal">
                              Perfil
                            </Label>
                            <Select
                              value={role}
                              onValueChange={(value) => setRole(value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um perfil" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectLabel>Perfil</SelectLabel>
                                  <SelectItem value="admin">Administrador</SelectItem>
                                  <SelectItem value="user">Supervisor</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          </span>
                          <span className="grid gap-2">
                            <Label htmlFor="builders" className="font-normal">
                              Builders
                            </Label>

                            <span className="w-full border rounded p-3">
                              {builders.map((b) => (
                                <span
                                  key={b.id}
                                  className="flex justify-start items-center gap-2"
                                >
                                  <Checkbox
                                    id={b.id}
                                    checked={buildersUser.includes(b.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setBuildersUser((prev) => [...prev, b.id]);
                                      } else {
                                        setBuildersUser((prev) =>
                                          prev.filter((id) => id !== b.id)
                                        );
                                      }
                                    }}
                                  />
                                  {b.name}
                                </span>
                              ))}
                            </span>

                          </span>

                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={
                            !nameUser ||
                            !emailUser ||
                            !password ||
                            !role
                          }
                          onClick={() => postUser()}>Criar</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

              </div>
            </div>


            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>

          </main>
        </div>


      </SidebarProvider>
    </AuthProvider>
  )
}