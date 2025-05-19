
import './globals.css'
import { ReactNode } from 'react'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

export const metadata = {
  title: 'Via srl',
  description: 'Gestión de ventas y proveedores',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="flex-col bg-[#0F0F0F]">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
