"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-background/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-foreground hidden sm:inline">Fluxy</span>
        </Link>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/login">Entrar</Link>
          </Button>
          <Button
            size="sm"
            className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 text-white"
            asChild
          >
            <Link href="/signup">Começar</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
