"use client"

import { useEffect, useState, useMemo, useCallback } from "react";
import { z } from "zod";
import axios from "axios";
import { useUsers } from "@/app/services/users.swr";
import { UserWithRelations } from "@/app/api/interfaces/user.interface";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button";
import { Building2, Eye, EyeClosed, SquarePen, Trash2, User } from "lucide-react";
import { format } from "date-fns";
import { ToastPersonalizado } from "@/components/toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
import { useBuilders } from "@/app/services/builders.swr";

const updateUserSchema = z.object({
  nameUser: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  emailUser: z.string().min(3, "Token Builder inválido"),
  role: z.string().min(3, "Token Rooter inválido")
});

type UpdateUserForms = z.infer<typeof updateUserSchema>;

interface ResultUpdatetUser {
  status: boolean,
  user: any,
  message: string
}

interface ResultDeleteUser {
  status: boolean,
  message: string
}

export default function Users() {

  const [editDialogOpenId, setEditDialogOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nameUser, setNameUser] = useState<string>("");
  const [emailUser, setEmailUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [idUser, setIdUser] = useState<string>("");
  const [buildersUser, setBuildersUser] = useState<string[]>([]);
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const { users, refresh } = useUsers();
  const [statusEye, setStatusEye] = useState<boolean>(false);
  const { builders } = useBuilders()

  useEffect(() => {
    if (session?.user) {
      if (session.user.role != "admin") {
        router.push("/tickets");
      }
    } else {
      router.push("/login")
    }
  }, [session, router]);

  const openEditBuilderDialog = useCallback((user: UserWithRelations) => {
    setEditDialogOpenId(user.id);
    setNameUser(user.name ?? "");
    setEmailUser(user.email);
    setRole(user.role);
    setIdUser(user.id);
    setBuildersUser(user.builderMemberships.map((m) => m.idBuilder));
  }, []);

  const closeEditBuilderDialog = useCallback(() => {
    setEditDialogOpenId(null);
  }, []);

  async function updateUser() {
    try {
      const payload: UpdateUserForms = {
        nameUser,
        emailUser,
        role
      };

      const validation = updateUserSchema.safeParse(payload);

      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          ToastPersonalizado({
            message: issue.message,
            type: "erro",
          });
        });
        return;
      }

      const { data } = await axios.put(
        "/api/users",
        {
          idUser,
          name: payload.nameUser,
          email: payload.emailUser,
          role: payload.role,
          builderMemberships: buildersUser,
          newPassword: password
        },
        {
          headers: {
            withCredentials: true
          }
        }
      )

      const result: ResultUpdatetUser = data;

      ToastPersonalizado({
        message: result.message,
        type: result.status ? "" : "erro",
      });

      closeEditBuilderDialog();

    } catch (e) {
      console.error(e)
      ToastPersonalizado({
        message:
          "Tivemos um erro inesperado, por gentileza contate um suporte!",
        type: "erro",
      });
    } finally {
      refresh();
    }
  }

  async function deleteUser(userId: string) {
    try {

      const { data } = await axios.delete(
        `/api/users/${userId}`,
        {
          headers: {
            withCredentials: true
          }
        }
      )

      const result: ResultDeleteUser = data;

      ToastPersonalizado({
        message: result.message,
        type: result.status ? "" : "erro",
      });

      closeEditBuilderDialog();

    } catch (e) {
      console.error(e)
      ToastPersonalizado({
        message:
          "Tivemos um erro inesperado, por gentileza contate um suporte!",
        type: "erro",
      });
    } finally {
       refresh()
    }
  }

  const columns = useMemo<ColumnDef<UserWithRelations>[]>(() => [
    {
      accessorKey: "name",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Nome</div>
      ),
      cell: ({ row }) => (
        <span className="font-medium block w-full text-center">
          {row.original.name}
        </span>
      )
    },
    {
      accessorKey: "email",
      header: () => (
        <div className="text-center text-zinc-600 w-full">E-mail</div>
      ),
      cell: ({ row }) => (
        <span className="block w-full text-zinc-600 text-center font-normal">
          {row.original.email}
        </span>
      )
    },
    {
      accessorKey: "role",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Perfil</div>
      ),
      cell: ({ row }) => (
        <div className="w-full">
          {row.original.role == "admin" &&
            <span className="font-medium block py-1 rounded text-center bg-primary/15 text-primary">
              Administrador
            </span>
          }
          {row.original.role == "user" &&
            <span className="font-medium block py-1 rounded text-center bg-zinc-600/15 text-zinc-600">
              Supervisor
            </span>
          }
        </div>
      )
    },
    {
      accessorKey: "builder",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Builders</div>
      ),
      cell: ({ row }) => (
        <div className="text-zinc-600 font-normal">
          {row.original.builderMemberships.length}
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Data de Inclusão</div>
      ),
      cell: ({ row }) => (
        <span className="font-medium block text-zinc-600 font-normal w-full text-center">
          {format(row.original.createdAt, "dd/MM/yyyy HH:mm")}
        </span>
      )
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Ações</div>
      ),
      cell: ({ row }) => {
        const user = row.original;

        return (
          <div className="flex justify-center gap-3 w-full">
            <Button
              type="button"
              variant={"ghost"}
              className="text-primary"
              size="sm"
              onClick={() => openEditBuilderDialog(user)}
            >
              <SquarePen />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"ghost"}
                  className="text-red-600"
                  size="sm"
                >
                  <Trash2 />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="mb-1 font-bold flex items-center gap-2 text-primary"><User /> Deletando usuário</AlertDialogTitle>
                  <AlertDialogDescription className="w-full flex gap-1">
                    Tem total certeza que deseja deletar o usuário <strong>{user.name}</strong>?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteUser(user.id)}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ], [openEditBuilderDialog, deleteUser]);

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-md border">
      <Dialog
        open={editDialogOpenId !== null}
        onOpenChange={(open) => {
          if (!open) closeEditBuilderDialog();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-primary">
              <Building2 className="size-5 shrink-0" />
              Atualizar usuário
            </DialogTitle>
            <DialogDescription>
              Edite os dados abaixo e salve para aplicar as alterações.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-nameBuilder" className="font-normal">
                Nome Completo
              </Label>
              <Input
                id="edit-nameBuilder"
                value={nameUser}
                onChange={(e) => setNameUser(e.target.value)}
                type="text"
                className="w-full"
                placeholder="Telek"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tokenBuilder" className="font-normal">
                E-mail Corporativo
              </Label>
              <Input
                id="edit-tokenBuilder"
                value={emailUser}
                onChange={(e) => setEmailUser(e.target.value)}
                type="text"
                className="w-full"
                placeholder="seu.nome@tahto.com.br"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tokenBuilder" className="font-normal">
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tokenRooter" className="font-normal">
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
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-url" className="font-normal">
                Builders
              </Label>

              <div className="w-full border rounded p-3">
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
                    <p>{b.name}</p>
                  </span>
                ))}
              </div>

            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeEditBuilderDialog}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              key={""}
              onClick={async () => {
                if (editDialogOpenId) {
                  await updateUser()
                };
              }}
            >
              Salvar alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader className="bg-muted/50">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="text-center font-normal align-middle">
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="text-center align-middle">
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext()
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}