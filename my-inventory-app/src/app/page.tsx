import HomeCard from "@/app/components/HomeCard";
import { FaBox, FaTruck, FaFileInvoice, FaChartLine } from "react-icons/fa";
export default function Home() {
  return(
   <div className=" text-[#FFFFFF] mt-12 mx-6">
      <h1 className="text-3xl font-bold mb-12">Sistema de Gestión de Inventario – Via SRL</h1>
      <p className="mb-12 mx-6 text-zinc-400 max-w-3xl">
        Este sistema permite administrar de forma eficiente el inventario de productos, proveedores, órdenes de compra y ventas.
        Desarrollado como parte del proyecto anual de Investigación Operativa 2025, combina backend robusto con una interfaz moderna y accesible.
      </p>

      <h2 className="text-xl mb-8 mx-6 font-semibold">Integrantes del proyecto:</h2>
      <ul className="list-disc ml-6 text-zinc-300 mb-10">
        <li className="mx-8">Vía Tomás</li>
        <li className="mx-8">Maldonado Luciana</li>
        <li className="mx-8">García Nicolás</li>
        <li className="mx-8">García Zacarías</li>
        <li className="mx-8">Vargas Rodrigo</li>
      </ul>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
        <HomeCard
          title="Artículos"
          description="Administrá el catálogo de productos, stock, modelos de inventario y cálculos de lote."
          icon={<FaBox />}
          route="/articulos"
        />
        <HomeCard
          title="Proveedores"
          description="Cargá nuevos proveedores, asociá artículos y visualizá relaciones activas."
          icon={<FaTruck />}
          route="/proveedores"
        />
        <HomeCard
          title="Órdenes de Compra"
          description="Creá, editá y gestioná órdenes según el stock y las necesidades de reposición."
          icon={<FaFileInvoice />}
          route="/ordenes"
        />
        <HomeCard
          title="Ventas"
          description="Registrá ventas con control de stock y generación automática de órdenes si aplica."
          icon={<FaChartLine />}
          route="/ventas"
        />
      </div>
    </div>
  );
}
