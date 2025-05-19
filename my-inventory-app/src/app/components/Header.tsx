// components/Header.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-[#27272A] text-white">
      <div className="flex items-center justify-between ">
        
        <div className="flex items-center rounded">
          <Image src="/image.png" alt="Logo" width={130} height={60} />
        </div>
       
        <nav className="flex mx-auto gap-6 items-center text-sm font-medium tracking-wide ml-auto ">
            <Link href="/" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Inicio</Link>
            <Link href="/articulos" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Artículos</Link>
            <Link href="/proveedores" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Proveedores</Link>
            <Link href="/ordenes" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Órdenes</Link>
            <Link href="/ventas" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Ventas</Link>
        </nav>
        
      </div>

    </header>
  )
}
