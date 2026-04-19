import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import "../styles/globals.css"
import toast, { Toaster } from 'react-hot-toast';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Fluxy - Software de Gestão',
  description: 'Fluxy é um software de gestão que ajuda você a otimizar seus processos e tomar decisões mais inteligentes.',
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
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
