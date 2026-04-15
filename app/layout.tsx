import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import "../styles/globals.css"
import toast, { Toaster } from 'react-hot-toast';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Telek - MassTicket',
  description: 'Faça transferencia de seus tickets dos builders de atendimento da blip em massa e com mais velocidade.',
  generator: 'V1.0',
  icons: {
    icon: [
      {
        url: '/icon.png',
        type: 'image/png',
      },
    ]
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body
        className="font-sans antialiased dark"
        cz-shortcut-listen="true"
      >

        {children}
        <Analytics />
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
