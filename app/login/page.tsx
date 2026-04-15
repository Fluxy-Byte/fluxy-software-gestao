"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/auth-client";
import { LockIcon, Eye, EyeClosed, CircleCheckBig, Mail, Info, ArrowLeft } from "lucide-react";
import Logo from "@/public/logoTelek.png";
import Image from "next/image";
import { ToastPersonalizado } from "@/components/toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import axios from "axios";

interface ResultNewPostResetPassWord {
  status: boolean,
  message: string
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isNotClient, setIsNotClient] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter();
  const [statusEye, setStatusEye] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("");
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setIsNotClient(true);
        // ToastPersonalizado(
        //   {
        //     message: "E-mail inválido ou senha incorreta!",
        //     type: "erro"
        //   }
        // )

      } else {
        router.push("/tickets")
      }
    } catch (err) {
      ToastPersonalizado(
        {
          message: "Erro ao fazer login. Tente novamente.",
          type: "erro"
        }
      )
    } finally {
      setIsLoading(false)
    }
  }

  const getResetPassWord = async () => {
    try {
      if (!email || email.length < 3) {
        ToastPersonalizado(
          {
            message: "Por favor verifique se esse e-mail esta válido!",
            type: "erro"
          }
        )
        return;
      }

      const { data } = await axios.post(
        "/api/reset-password",
        {
          email
        }
      )

      const resultPostNewReset: ResultNewPostResetPassWord = data;

      ToastPersonalizado(
        {
          message: resultPostNewReset.message,
          type: resultPostNewReset.status ? "sucesso" : "erro"
        }
      )
    } catch (e) {
      console.error(e);
      ToastPersonalizado(
        {
          message: "Erro interno no serviço. Tente novamente.",
          type: "erro"
        }
      )
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE */}
      <div className="hidden md:flex w-1/2 h-screen bg-gradient-to-r from-primary/90 via-primary to-primary flex-col px-30 pt-20 justify-between">

        <div className="w-full gap-14 flex flex-col justify-start items-start">
          <div className="text-white/70 text-sm">
            <Image src={Logo.src} width={250} height={250} alt="Logo Telek" />
          </div>

          <div className="text-white flex flex-col gap-3">
            <h1 className="text-4xl font-semibold">
              Transferência Massiva
              de Tickets
            </h1>
            <h2 className="text-xl text-white/80">
              Ambiente administrativo interno Telek.
            </h2>
          </div>
        </div>

        <div>
          <p className="text-zinc-300">
            © 2026 Telek Sistemas. Todos os direitos reservados.
          </p>
        </div>


      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8">

        {!isNotClient && (
          <div className="w-full max-w-lg bg-card rounded-2xl p-8 md:p-12 shadow-2xl">

            <div className="flex flex-col gap-6 mb-10">

              <h3 className="text-4xl font-semibold text-black">
                Acesso ao Painel de Transferência
              </h3>

              <p className="text-zinc-500 flex items-center justify-start gap-2 text-base">
                <LockIcon size={18} /> Acesso restrito a usuários autorizados.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-3">
                <Label htmlFor="email" className="text-black text-base">E-mail corporativo</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.nome@tahto.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-3">
                <span className="min-w-full flex justify-between">
                  <Label htmlFor="password" className="text-black text-base">Senha</Label>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="link">Esqueceu a senha?</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-sm">
                      <DialogHeader>
                        <DialogTitle>Recuperar senha</DialogTitle>
                        <DialogDescription>
                          Informe seu e-mail corporativo para receber as instruções de redefinição de senha.
                        </DialogDescription>
                      </DialogHeader>
                      <FieldGroup>
                        <Field>
                          <Label htmlFor="email">E-mail corporativo</Label>
                          <span className="flex justify-center items-center border rounded">
                            <Mail className="ml-2 text-zinc-500" />
                            <Input id="email"
                              name="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-12 p-2 rounded text-sm border-none outline-none focus:outline-none focus:ring-0 placeholder:text-zinc-500"
                              placeholder="seu.nome@tahto.com.br" />
                          </span>

                        </Field>
                      </FieldGroup>
                      <DialogFooter className="flex w-full gap-2">
                        <DialogClose asChild className="flex-1">
                          <Button variant="outline" size={"commum"} className="w-full">
                            Cancelar
                          </Button>
                        </DialogClose>

                        <Button onClick={() => getResetPassWord()} size={"commum"} className="flex-1 w-full">
                          <CircleCheckBig /> Enviar instruções
                        </Button>
                      </DialogFooter>
                    </DialogContent>

                  </Dialog>
                </span>
                <span className="w-full flex items-center relative">
                  <Input
                    id="password"
                    type={statusEye ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
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

              {/* <div className="flex justify-start items-center gap-2">
              <Checkbox className="w-5 h-5" />
              <p>Manter-me conectado</p>
            </div> */}

              <Button
                type="submit"
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(180deg, #1B6F96 0%, #145C7D 100%)',
                  borderRadius: '10px',
                  fontWeight: 600
                }}
                size={"commum"}
                className="w-full text-white text-md transition-all duration-300 hover:scale-102 hover:shadow-2xl mb-8"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Carregando...
                  </div>
                ) : (
                  "Acessar Painel"
                )}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/10"></div>
                </div>
              </div>


              <div className="flex justify-around items-center mt-6">
                <Link
                  href={"https://api.whatsapp.com/send?phone=553432937116&text=Boa%20tarde!%20Preciso%20de%20suporte%20com%20a%20tela%20de%20transfer%C3%AAncia%20Tahto."}
                  className="text-zinc-600 hover:underline text-base"
                >
                  Suporte técnico Telek
                </Link>
                <p className="text-purple-500/40">
                  •
                </p>
                <Link
                  href={"https://www.tahto.com.br/politica-de-privacidade/"}
                  className="text-zinc-600 hover:underline text-base"
                >
                  Política de privacidade
                </Link>
              </div>
            </form>

          </div>
        )}


        {isNotClient && (
          <div className="w-full max-w-lg bg-card rounded-2xl p-8 md:p-12 shadow-2xl">

            <div className="flex flex-col gap-6 mb-10">

              <h3 className="text-4xl font-semibold text-black">
                Acesso não autorizado
              </h3>

              <p className="text-zinc-500 flex items-center justify-start gap-2 text-base">
                Não intentificamos permissão ativa para este usuário.
              </p>


              <div className="flex justify-start items-start bg-zinc-200 p-4 rounded gap-2">
                <span className="h-full">
                  <Info className="text-primary mt-0.5" size={18} />
                </span>

                <span className="text-sm h-full" >
                  Por favor, entre em contato com o time responsável ou o seu gestor para as devidas liberações de acesso.
                </span>
              </div>

              <Button
                onClick={() => setIsNotClient(false)}
                disabled={isLoading}
                style={{
                  background: 'linear-gradient(180deg, #1B6F96 0%, #145C7D 100%)',
                  borderRadius: '10px',
                  fontWeight: 600
                }}
                size={"commum"}
                className="w-full text-white text-md transition-all duration-300 hover:scale-102 hover:shadow-2xl "
              >
                <ArrowLeft /> Voltar ao login
              </Button>
            </div>

            <div className="flex justify-around items-center mt-6">
              <Link
                href={"https://api.whatsapp.com/send?phone=553432937116&text=Boa%20tarde!%20Preciso%20de%20suporte%20com%20a%20tela%20de%20transfer%C3%AAncia%20Tahto."}
                className="text-zinc-600 hover:underline text-base"
              >
                Suporte técnico Telek
              </Link>
              <p className="text-purple-500/40">
                •
              </p>
              <Link
                href={"https://www.tahto.com.br/politica-de-privacidade/"}
                className="text-zinc-600 hover:underline text-base"
              >
                Política de privacidade
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}