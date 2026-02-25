import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/context/AuthContext'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'

export const metadata: Metadata = {
  title: 'Telefutura - CRM',
  description: 'Rebuild of test.gestionedoc.it',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className="antialiased font-sans bg-[#0f111a] text-white">
        <AuthProvider>
          <div className="flex min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}
