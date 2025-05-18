// components/Header.tsx
import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <header className="bg-[#27272A] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        
        <div className="flex items-center gap-2  bg-black px-4 py-2 rounded">
          <Image src="/image.png" alt="Logo" width={130} height={60} />
        </div>
       
        <nav className="flex mx-auto items-center text-sm font-medium tracking-wide ml-auto">
          <div className='w-[60px]'>
            <Link href="/" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Inicio</Link>
          </div>
           <div className='w-[80px]'>
            <Link href="/articulos" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Artículos</Link>
          </div>
          <div className='w-[100px]'>
            <Link href="/proveedores" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Proveedores</Link>
          </div>
          <div className='w-[80px]'>
            <Link href="/ordenes" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Órdenes</Link>
          </div>
          <div className='w-[60px]'>
            <Link href="/ventas" className="text-[#FFFFFF] no-underline hover:text-[#A1A1AA]">Ventas</Link>
          </div>
        </nav>
        
      </div>

    </header>
  )
}
