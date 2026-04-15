"use client"
import { Builder } from "@/app/services/builders.swr";
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Briefcase, SquarePen, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { ToastPersonalizado } from "@/components/toast";
import { useBuilders } from "@/app/services/builders.swr";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { authClient } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

interface ResultCreateOrganization {
  status: boolean,
  organization: any | null,
  message: string
}

const putBuilderSchema = z.object({
  id: z.string().min(1, "ID do builder é obrigatório"),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  tokenBuilder: z.string().min(3, "Token Builder inválido"),
  tokenRooter: z.string().min(3, "Token Rooter inválido"),
  url: z.string().min(3, "URL inválida"),
});

type PutBuilderFormData = z.infer<typeof putBuilderSchema>;

export default function Builders() {
  const { builders, refresh } = useBuilders();
  const [editDialogOpenId, setEditDialogOpenId] = useState<string | null>(null);
  const [nameBuilder, setNameBuilder] = useState<string>("");
  const [tokenBuilder, setTokenBuilder] = useState<string>("");
  const [tokenRooter, setTokenRooter] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const { data: session } = authClient.useSession();
  const router = useRouter()

  useEffect(() => {
    if (session?.user) {
      if (session.user.role != "admin") {
        router.push("/tickets");
      }
    } else {
      router.push("/login")
    }
  }, [session, router]);

  const openEditBuilderDialog = useCallback((builder: Builder) => {
    setEditDialogOpenId(builder.id);
    setNameBuilder(builder.name);
    setTokenBuilder(builder.tokenBuilder);
    setTokenRooter(builder.tokenRooter);
    setUrl(builder.url);
  }, []);

  const closeEditBuilderDialog = useCallback(() => {
    setEditDialogOpenId(null);
  }, []);

  async function putBuilder(idBuilder: string) {
    try {
      const payload: PutBuilderFormData = {
        id: idBuilder,
        name: nameBuilder,
        tokenBuilder,
        tokenRooter,
        url,
      };

      const validation = putBuilderSchema.safeParse(payload);

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
        `/api/builders`,
        validation.data,
        {
          headers: {
            withCredentials: true,
          },
        }
      );

      const body: ResultCreateOrganization = data;

      if (body.status == true) {
        ToastPersonalizado({ message: "Sucesso na atualização do builder" });
        closeEditBuilderDialog();
        refresh(); // Refresh na lista de builders
      } else {
        ToastPersonalizado({
          message:
            body.message ??
            "Tivemos um erro inesperado, por gentileza contate um suporte!",
          type: "erro",
        });
      }
    } catch (e) {
      console.error(e);
      ToastPersonalizado({
        message:
          "Tivemos um erro inesperado, por gentileza contate um suporte!",
        type: "erro",
      });
    }
  }

  const deleteBuilder = useCallback(async (idBuilder: string) => {
    try {
      if (idBuilder) {
        const { data } = await axios.delete(
          `/api/builders/${idBuilder}`,
          {
            withCredentials: true,
          }
        );

        if (data.status === true) {
          ToastPersonalizado({
            message: "Sucesso ao deletar builder",
          });
        } else {
          ToastPersonalizado({
            message:
              data.message ??
              "Tivemos um erro inesperado, por gentileza contate um suporte!",
            type: "erro",
          });
        }
      } else {
        ToastPersonalizado({
          message: "ID inválido para deletar.",
          type: "erro",
        });
      }
    } catch (e: any) {
      console.error(e);
      ToastPersonalizado({
        message:
          e?.response?.data?.message ??
          "Tivemos um erro inesperado, por gentileza contate um suporte!",
        type: "erro",
      });
    } finally {
      refresh()
    }
  }, []);

  const columns = useMemo<ColumnDef<Builder>[]>(() => [
    {
      accessorKey: "name",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Nome do Builder</div>
      ),
      cell: ({ row }) => (
        <span className="font-medium block w-full text-center">
          {row.original.name}
        </span>
      )
    },
    {
      accessorKey: "tokenBuilder",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Token do Builder</div>
      ),
      cell: ({ row }) => (
        <span className="block w-full text-zinc-600 text-center font-normal">
          ...{row.original.tokenBuilder.slice(-20)}
        </span>
      )
    },
    {
      accessorKey: "tokenRooter",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Token do Rooter</div>
      ),
      cell: ({ row }) => (
        <span className="block w-full text-zinc-600 text-center font-normal">
          ...{row.original.tokenRooter.slice(-20)}
        </span>
      )
    },
    {
      accessorKey: "createDate",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Data de Inclusão</div>
      ),
      cell: ({ row }) => (
        <span className="block w-full text-zinc-600 text-center font-normal">
          {format(row.original.createDate, "dd/MM/yyyy HH:mm")}
        </span>
      )
    },
    {
      id: "members",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Adm/Gestores Vinculados</div>
      ),
      cell: ({ row }) => {
        const numeroDeMembros = row.original.builderMemberships?.length ?? 0;

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="table">{numeroDeMembros === 1
                ? `${numeroDeMembros} usuário`
                : `${numeroDeMembros} usuários`}</Button>
            </PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>{numeroDeMembros === 1
                  ? `Usuário`
                  : `Usuários`}</PopoverTitle>
                <PopoverDescription>
                  <span className="flex flex-col justify-center items-start gap-2">
                    {
                      row.original.builderMemberships.map((m) => (
                        <Badge key={m.user.name}>{m.user.name}</Badge>
                      ))
                    }
                  </span>
                </PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        );
      },
    },
    {
      id: "actions",
      header: () => (
        <div className="text-center text-zinc-600 w-full">Ações</div>
      ),
      cell: ({ row }) => {
        const builder = row.original;

        return (
          <div className="flex justify-center gap-3 w-full">
            <Button
              type="button"
              variant={"ghost"}
              size="sm"
              className="text-primary"
              onClick={() => openEditBuilderDialog(builder)}
            >
              <SquarePen size={200} className="text-2xl" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant={"ghost"}
                  className="text-red-700"
                  size="sm"
                >
                  <Trash2 size={10} />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="mb-1 font-semibold flex items-center gap-2 text-primary"><Briefcase /> Deletando builder</AlertDialogTitle>
                  <AlertDialogDescription className="w-full text-base">
                    Tem total certeza que deseja deletar o builder "<b>{builder.name}</b>" ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter >
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteBuilder(builder.id)}>Confirmar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      },
    },
  ], [openEditBuilderDialog, deleteBuilder]);

  const table = useReactTable({
    data: builders,
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
              <Briefcase className="size-5 shrink-0" />
              Atualizar builder
            </DialogTitle>
            <DialogDescription>
              Edite os dados abaixo e salve para aplicar as alterações.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-nameBuilder" className="font-normal">
                Nome do builder
              </Label>
              <Input
                id="edit-nameBuilder"
                value={nameBuilder}
                onChange={(e) => setNameBuilder(e.target.value)}
                type="text"
                className="w-full"
                placeholder="Telek"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tokenBuilder" className="font-normal">
                Token do Builder
              </Label>
              <Input
                id="edit-tokenBuilder"
                value={tokenBuilder}
                onChange={(e) => setTokenBuilder(e.target.value)}
                type="text"
                className="w-full"
                placeholder="Key …"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-tokenRooter" className="font-normal">
                Token do Rooter
              </Label>
              <Input
                id="edit-tokenRooter"
                value={tokenRooter}
                onChange={(e) => setTokenRooter(e.target.value)}
                type="text"
                className="w-full"
                placeholder="Key …"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-url" className="font-normal">
                URL de conexão
              </Label>
              <Input
                id="edit-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                type="text"
                className="w-full"
                placeholder="WWW.EXEMPLO.COM.BR"
              />
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
              onClick={async () => {
                if (editDialogOpenId) await putBuilder(editDialogOpenId);
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
