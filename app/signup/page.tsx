"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageCircle, Zap } from "lucide-react"
import { authClient } from "@/lib/auth/auth-client"

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("As senhas não coincidem")
      return
    }

    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres")
      return
    }

    setIsLoading(true)

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      })

      if (result.error) {
        setError(result.error.message || "Erro ao criar conta")
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
      console.log(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden relative">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-600 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-500 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl relative z-10">
        {/* Left side - Brand */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-12 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-6 right-6 w-32 h-32 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full blur-2xl opacity-30 rotate-45"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-t from-yellow-400 to-transparent rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Fluxy</h1>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Comece sua Jornada
            </h2>
            <p className="text-white/90 text-lg mb-6">
              Crie uma conta e comece a gerenciar seus agentes de IA agora mesmo
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/80">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span>Automação inteligente em tempo real</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span>Análise avançada de conversas</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span>Escalabilidade sem limites</span>
              </div>
            </div>
          </div>

          <div className="text-white/70 text-sm relative z-10">
            Junte-se a centenas de empresas usando Fluxy
          </div>
        </div>

        {/* Right side - Signup Form */}
        <div className="flex flex-col justify-center">
          <div className="bg-card border border-purple-500/20 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="mb-8">
              <p className="text-purple-400 text-sm font-semibold tracking-wide uppercase mb-2">
                Nova Conta
              </p>
              <h3 className="text-3xl font-bold text-foreground mb-2">
                Criar Conta
              </h3>
              <p className="text-muted-foreground">
                Preencha os dados abaixo para começar
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-input border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu.nome@tahto.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-input border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-input border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirmar Senha
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="bg-input border-purple-500/20 text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:ring-purple-500/20"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white font-semibold py-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Criando conta...
                  </div>
                ) : (
                  "Criar Conta"
                )}
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/20"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    Já tem uma conta?
                  </span>
                </div>
              </div>

              <Link
                href="/login"
                className="block w-full text-center px-4 py-3 rounded-lg border border-purple-500/30 text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all duration-300 font-medium"
              >
                Fazer login
              </Link>
            </form>
          </div>

          <p className="text-center text-muted-foreground text-xs mt-6">
            © 2024 Fluxy Technologies. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </div>
  )
}
