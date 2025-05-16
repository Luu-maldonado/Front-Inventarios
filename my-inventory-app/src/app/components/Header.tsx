// components/Header.tsx
import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="flex gap-4">
        <Link href="/" className="hover:underline">Inicio</Link>
        <Link href="/articulos" className="hover:underline">Artículos</Link>
        <Link href="/proveedores" className="hover:underline">Proveedores</Link>
        <Link href="/ordenes" className="hover:underline">Órdenes</Link>
        <Link href="/ventas" className="hover:underline">Ventas</Link>
      </nav>
    </header>
  )
}
