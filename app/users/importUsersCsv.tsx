"use client";
import { useRef } from "react";
import { useState } from "react";
import SpinnerCustom from "@/components/loading";
import { ToastPersonalizado } from "@/components/toast";
import { useUsers } from "@/app/services/users.swr";
import {
    Field,
    FieldDescription,
    FieldLabel,
} from "@/components/ui/field";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import axios from "axios"
import { Button } from "@/components/ui/button";
import { Upload, FilePlusCorner, CloudAlert, ArrowDownToLine, FileSpreadsheet } from "lucide-react";
import { UserWithRelations } from "@/app/api/interfaces/user.interface";
import { Badge } from "@/components/ui/badge";
import { useBuilders } from "@/app/services/builders.swr";
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from "@/components/ui/popover"

interface UserParsed {
    nome: string;
    email: string;
    senha: string;
    perfil: "admin" | "user";
    builders: string[]
}

interface UserParsedError {
    nome: string;
    email: string;
    senha: string;
    perfil: "admin" | "user";
    message: string;
}

interface ResultCreateUser {
    status: boolean,
    user: UserWithRelations
    message: string
}

export default function ImportCSVDialog() {
    const [users, setUsers] = useState<UserParsed[]>([]);
    const [erroUsers, setErroUsers] = useState<UserParsedError[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const { refresh } = useUsers();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileName, setFileName] = useState("Nenhum arquivo selecionado");
    const { builders } = useBuilders()

    function handleFileUpload(file: File) {
        setUsers([]);
        setError("");

        if (!file.type.includes("csv") && !file.name.endsWith(".csv")) {
            setError("O arquivo precisa ser um CSV.");
            return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
            const text = event.target?.result as string;

            const lines = text
                .split("\n")
                .map((line) => line.replace("\r", "").trim())
                .filter(Boolean);

            if (lines.length < 2) {
                setError("CSV vazio ou inválido.");
                return;
            }

            const headers = lines[0].split(",");

            const expectedHeaders = ["nome", "email", "senha", "perfil", "listaDeBuilders"];

            const isValidHeader = expectedHeaders.every(
                (h, i) => headers[i]?.trim() === h
            );

            if (!isValidHeader) {
                setError("Cabeçalho inválido. Use somente: nome, email, senha, perfil e listaDeBuilders");
                return;
            }

            const parsedUsers: UserParsed[] = [];

            for (let i = 1; i < lines.length; i++) {
                const [nome, email, senha, perfil, listaDeBuilders] = lines[i].split(",");

                if (!nome || !email || !senha || !perfil || !listaDeBuilders) {
                    setError(
                        `Linha ${i + 1} inválida: todos os campos são obrigatórios.`
                    );
                    return;
                }

                let mappedRole: "admin" | "user";

                if (perfil.trim() === "supervisor") {
                    mappedRole = "user";
                } else if (perfil.trim() === "administrador") {
                    mappedRole = "admin";
                } else {
                    setError(`Linha ${i + 1}: role inválido.`);
                    return;
                }
                console.log(listaDeBuilders)

                parsedUsers.push({
                    nome: nome.trim(),
                    email: email.trim(),
                    senha: senha.trim(),
                    perfil: mappedRole,
                    builders: listaDeBuilders.split(";")
                });
            }

            setUsers(parsedUsers);
        };

        reader.readAsText(file);
    }

    async function handleSubmit() {
        try {
            setIsLoading(true)
            const errors = []
            for (let i = 0; i < users.length; i++) {

                const buildersUser = users[i].builders;

                const builderMemberships: string[] = buildersUser
                    .map((b: string) => builders.find((builder) => builder.name === b)?.id)
                    .filter((id): id is string => !!id);

                const payload = {
                    nameUser: users[i].nome,
                    emailUser: users[i].email,
                    password: users[i].senha,
                    role: users[i].perfil,
                    builderMemberships
                };

                console.log(payload)

                const { data } = await axios.post(
                    "/api/users",
                    {
                        name: payload.nameUser,
                        email: payload.emailUser,
                        role: payload.role,
                        password: payload.password,
                        builderMemberships: payload.builderMemberships
                    },
                    {
                        headers: {
                            withCredentials: true
                        }
                    }
                )

                const result: ResultCreateUser = data;
                if (result.status == false) {
                    errors.push({
                        ...users[i],
                        message: result.message
                    })
                }
            }

            ToastPersonalizado({
                message: "Precesso finalizado"
            });
            refresh();
            setErroUsers(errors);
            setIsLoading(false);
            return;
        } catch (e) {
            ToastPersonalizado({
                message: "Erro interno no serviço",
                type: "erro"
            });
            console.error(e);
            setIsLoading(false);
            return;
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size={"commum"} variant="outline" className=" hidden md:flex">
                    <Upload className="mr-2" /> Importar Usuários
                </Button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Importar usuários</DialogTitle>

                    <DialogDescription>
                        Anexe um arquivo CSV com os usuários
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">

                    <Field>
                        <input
                            id="csv"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setFileName(file.name);
                                    handleFileUpload(file);
                                }
                            }}
                            ref={fileInputRef}
                        />

                        {/* Botão customizado */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted transition"
                        >
                            <FileSpreadsheet className="w-10 h-10 mb-2 text-primary" />

                            <p className="text-sm">
                                <span className="text-primary font-medium">
                                    Clique para selecionar
                                </span>{" "}
                                ou arraste o arquivo
                            </p>

                            <p className="text-xs text-muted-foreground mt-1">
                                Formato aceito: CSV
                            </p>

                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setFileName(file.name);
                                        handleFileUpload(file);
                                    }
                                }}
                            />
                        </div>

                        <div className="bg-zinc-200 flex flex-col gap-2 p-2 rounded">
                            <span className="flex flex-col gap-2">
                                <h3 className="font-semibold text-black">Formato do arquivo:</h3>
                                <h6 className="text-sm text-zinc-600">O arquivo deve conter as seguintes colunas (na ordem):</h6>
                                <span className="ml-5 flex flex-col">
                                    <p className="text-sm text-zinc-600"><b>Nome</b> — Nome completo do usuário</p>
                                    <p className="text-sm text-zinc-600"><b>Email</b> — Email corporativo</p>
                                    <p className="text-sm text-zinc-600"><b>Senha</b> — Senha do usuário</p>
                                    <p className="text-sm text-zinc-600"><b>Perfil</b> — "supervisor" ou "administrador"</p>
                                    <p className="text-sm text-zinc-600"><b>listaDeBuilders</b> — Nomes dos builders (usar nomes exatos) separados por ;</p>
                                </span>

                            </span>

                            <span className="text-sm text-zinc-600">
                                <b>Builders disponíveis:</b> {builders.map((b) => (b.name))}
                            </span>

                        </div>

                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </Field>

                    {users.length > 0 && (
                        <div>
                            <p className="font-medium">
                                {users.length} contatos encontrados
                            </p>
                        </div>
                    )}

                    {erroUsers.length > 0 && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button size={"commum"} variant="destructive">< CloudAlert /> Contatos que falhou</Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverHeader>
                                    <PopoverTitle>Lista de falha</PopoverTitle>
                                    <PopoverDescription className="flex flex-col justify-start items-center gap-2">
                                        {
                                            erroUsers.map((u) => (
                                                <Badge key={u.email}>{u.nome} - {u.message}</Badge>
                                            ))
                                        }
                                    </PopoverDescription>
                                </PopoverHeader>
                            </PopoverContent>
                        </Popover>
                    )}

                    <div className="w-full flex justify-between items-center">
                        <div>
                            <Button
                                size={"commum"}
                                onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = "/modelo-usuarios.csv";
                                    link.download = "modelo-usuarios.csv";
                                    link.click();
                                }}
                                variant={"classic"}>
                                <ArrowDownToLine />
                                Baixar modelo CSV
                            </Button>
                        </div>
                        <div className="flex justify-end gap-2">
                            <DialogClose asChild>
                                <Button onClick={() => (setError(""), setErroUsers([]))} size={"commum"} variant="outline">Fechar</Button>
                            </DialogClose>
                            <Button
                                size={"commum"}
                                disabled={users.length === 0 || isLoading}
                                onClick={handleSubmit}
                            >
                                {isLoading ? <span className="flex justify-center items-center gap-2"><SpinnerCustom /> Cadastrando...</span> : "Cadastrar"}
                            </Button>
                        </div>
                    </div>



                </div>
            </DialogContent>
        </Dialog>
    );
}