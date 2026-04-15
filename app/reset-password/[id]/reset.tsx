"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SpinnerCustom from "@/components/loading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeClosed, TicketCheck } from "lucide-react";
import { z } from "zod";
import { ToastPersonalizado } from "@/components/toast";
import { authClient } from "@/lib/auth/auth-client";

interface ResultGetReset {
    status: boolean;
    message: string;
}

interface ResultUpdateReset {
    status: boolean;
    message: string;
}


const resetSchema = z.object({
    password: z
        .string()
        .min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

export default function Reset(props: { token: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [result, setResult] = useState<ResultGetReset | null>(null);
    const [statusEyeOne, setStatusEyeOne] = useState<boolean>(false);
    const [statusEyeTwo, setStatusEyeTwo] = useState<boolean>(false);
    const [errorToken, setErrorToken] = useState<string | null>(null)
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [errors, setErrors] = useState<any>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (!props.token) {
            router.push("/login");
            return;
        }

        async function getResetPassWord() {
            try {
                const { data } = await axios.get(
                    `/api/reset-password/${props.token}`
                );
                setResult(data);
            } catch (e) {
                setResult({
                    status: false,
                    message: "Tivemos um erro interno!",
                });
            } finally {
                setIsLoading(false);
            }
        }

        getResetPassWord();
    }, [props.token, router]);

    async function handleResetPassword() {
        setErrors({});

        const validation = resetSchema.safeParse({
            password,
            confirmPassword,
        });

        if (!validation.success) {
            const fieldErrors: any = {};
            validation.error.issues.forEach((err) => {
                fieldErrors[err.path[0]] = err.message;
            });
            setErrors(fieldErrors);
            return;
        }

        try {
            setIsSubmitting(true);

            const { data, error } = await authClient.resetPassword({
                newPassword: password,
                token: props.token,
            });

            if (data) {
                ToastPersonalizado({
                    message: data?.status == true ? "Senha atualizada com sucesso" : "Erro ao atualizar senha, tente novamente!",
                    type: data?.status == true ? "sucesso" : "erro"
                })

                if (data?.status == true) {
                    router.push("/login");
                }

                return;
            } else if (error) {
                setErrorToken(error.code ?? null)
            }

        } catch (e: any) {
            ToastPersonalizado({
                message: e?.response?.data?.message || "Erro ao redefinir senha",
                type: "erro"
            })
        } finally {
            setIsSubmitting(false);
        }
    }

    // Loading
    if (isLoading) {
        return (
            <div className="w-full h-screen flex flex-col justify-center items-center">
                <SpinnerCustom />
                <p className="text-zinc-500">Validando solicitação...</p>
            </div>
        );
    }

    // Erro token inválido
    if (errorToken) {
        return (
            <div className="h-screen flex flex-col justify-center items-center gap-4 text-center">
                <div className="flex justify-center items-center gap-2">
                    <span className="rounded p-2 bg-primary">
                        <TicketCheck className="text-white" />
                    </span>
                    <h1 className="text-primary font-bold text-2xl">
                        Mass Ticket
                    </h1>
                </div>

                <p className="text-zinc-800 max-w-sm">
                    Para redefinir sua senha, preencha os campos abaixo
                </p>
                <p className="text-zinc-500 max-w-sm text-sm">
                    Caso esteja com dificuldades de definição de senha pedimos que entre em contato com seu gestor para que possa alterar sua senha dentro da ferramenta.
                </p>
                <h1 className="text-red-500 font-normal">{errorToken == "INVALID_TOKEN" ? "Esse acesso ja foi utilizado ou esta expirado tente novamente do inicio refazendo o mesmo passo de resete de senha" : "Erro desconhecido solicite apoio a um administrador"}</h1>
                <Button onClick={() => router.push("/login")}>
                    Voltar ao login
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col justify-center items-center text-center gap-4 px-4">

            {/* Header */}
            <div className="flex justify-center items-center gap-2">
                <span className="rounded p-2 bg-primary">
                    <TicketCheck className="text-white" />
                </span>
                <h1 className="text-primary font-bold text-2xl">
                    Mass Ticket
                </h1>
            </div>

            <p className="text-zinc-800 max-w-sm">
                Para redefinir sua senha, preencha os campos abaixo
            </p>
            <p className="text-zinc-500 max-w-sm text-sm">
                Caso esteja com dificuldades de definição de senha pedimos que entre em contato com seu gestor para que possa alterar sua senha dentro da ferramenta.
            </p>

            {/* Form */}
            <div className="flex flex-col gap-3 w-full max-w-sm">

                <div className="text-left gap-1 flex flex-col">
                    <Label>Nova senha</Label>
                    <span className="w-full flex items-center relative">
                        <Input
                            id="password"
                            type={statusEyeOne ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        // espaço pro ícone
                        />

                        {statusEyeOne ? (
                            <EyeClosed
                                onClick={() => setStatusEyeOne(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-black transition"
                                size={20}
                            />
                        ) : (
                            <Eye
                                onClick={() => setStatusEyeOne(true)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-black transition"
                                size={20}
                            />
                        )}
                    </span>
                    {errors.password && (
                        <p className="text-red-500 text-sm">{errors.password}</p>
                    )}
                </div>

                <div className="text-left gap-1 flex flex-col">
                    <Label>Confirmar senha</Label>
                    <span className="w-full flex items-center relative">
                        <Input
                            id="password"
                            type={statusEyeTwo ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />

                        {statusEyeTwo ? (
                            <EyeClosed
                                onClick={() => setStatusEyeTwo(false)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-black transition"
                                size={20}
                            />
                        ) : (
                            <Eye
                                onClick={() => setStatusEyeTwo(true)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 cursor-pointer hover:text-black transition"
                                size={20}
                            />
                        )}
                    </span>
                    {errors.confirmPassword && (
                        <p className="text-red-500 text-sm">
                            {errors.confirmPassword}
                        </p>
                    )}
                </div>

                <Button
                    onClick={handleResetPassword}
                    disabled={isSubmitting}
                    size={"commum"}
                    className="mt-2"
                >
                    {isSubmitting ?
                        <span>
                            <SpinnerCustom /> Redefinindo
                        </span> :
                        "Redefinir Senha"
                    }
                </Button>
            </div>
        </div>
    );
}