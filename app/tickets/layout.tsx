"use client"
import { AuthProvider } from "@/components/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="w-full">
        {children}
      </div>
    </AuthProvider>
  )
}
