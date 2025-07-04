"use client";

import { useEffect, useState } from "react";

interface Articulo {
  idArticulo?: number;
  nombreArticulo: string;
  descripcion: string;
  proveedor?: string;
  modeloInv: number;
  categoriaArt: number;
  demandaDiaria: number;
  tiempoRevision: number;
  stockActual?: number;
  stockSeguridad?: number;
  puntoPedido?: string;
  cgi?: string;
  costoAlmacen: number;
  costoPedido?: number;
  costoCompra?: number;
  stock?: {
    stockActual: number;
    stockSeguridad: number;
  };
  proveedorPredeterminado?: ProveedorArticulo;
  estado?: string;
  fechaBaja?: string;
  masterArticulo?: {
    nombreMaestro: string;
    idMaestroArticulo: number;
  };
}
interface ProveedorArticulo {
  idProveedor: number;
  precioUnitario: number;
  tiempoEntregaDias: number;
  idArticulo: number;
  predeterminado: boolean;
  fechaFinProveedorArticulo?: string;
  costoPedido: number;
}
interface Ventas{
  nVenta: number;
  descripcionVenta: string;
  totalVenta: number;
  detalleVenta: DetalleVenta[];
}

interface DetalleVenta{
  cantidadArticulo: number;
    idArticulo: number;
    subTotal?: number;
  }


interface ArticuloSeleccionado extends Articulo {
  cantidadArticulo: number;
}

export default function Ventas() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [busqueda] = useState("");
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloSeleccionado[]>([]);
  const [venta, setVenta] = useState<Ventas[]>([]);
  const [mensaje, setMensaje] = useState("");
  //const [modalEditar, setModalEditar] = useState<Articulo | null>(null);
  //const [modalProveedor, setModalProveedor] = useState<Articulo | null>(null);

    const obtenerArticulos = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/MaestroArticulos/articulos/list-art-datos"
      );
      const data = await res.json();
      const articulosTransformados: Articulo[] = data.map((item: Articulo) => ({
        idArticulo: item.idArticulo,
        nombreArticulo: item.nombreArticulo,
        descripcion: item.descripcion,
        categoriaArt: item.categoriaArt,
        proveedor: item.proveedor || "sin asignar",
        modeloInv: item.modeloInv,
        demandaDiaria: item.demandaDiaria,
        tiempoRevision: item.tiempoRevision,
        stockActual: Number(item.stockActual),
        stockSeguridad: Number(item.stockSeguridad),
        puntoPedido: item.puntoPedido,
        cgi: item.cgi,
        costoAlmacen: Number(item.costoAlmacen),
      }));
      setArticulos(articulosTransformados);
    } catch (error) {
      console.error("Error al cargar artículos:", error);
    }
  };

useEffect(() => {
  obtenerArticulos();
  obtenerVentas();
}, []);
 useEffect(() => {
    fetch("http://localhost:5000/MaestroArticulos/articulos/list-art-datos")
      .then((res) => res.json())
      .then((data) => {
        const activos = data.filter((a: Articulo) => a.stockActual !== undefined && a.stockActual > 0); 
        const transformados = activos.map((a: Articulo) => ({
          idArticulo: a.idArticulo,
          nombreArticulo: a.nombreArticulo,
          costoCompra: a.costoAlmacen, 
          stockActual: a.stockActual,
        }));
        setArticulos(transformados);
      })
      .catch((err) => console.error("Error cargando artículos:", err));
  }, []);


  const agregarArticulo = (id: number) => {
    const art = articulos.find((a) => a.idArticulo === id);
    if (art && !articuloSeleccionado.some((sel) => sel.idArticulo === id)) {
      setArticuloSeleccionado([...articuloSeleccionado, { ...art, cantidadArticulo: 1 }]);
      setMensaje("");
    }
  };

  const obtenerVentas = async () => {
    try{
      const res = await fetch("http://localhost:5000/api/Ventas/AllVentas")
      const data = await res.json();
      const ventasTransformadas: Ventas[] = data.map((item: Ventas) =>({
        nVenta: item.nVenta,
        descripcionVenta: item.descripcionVenta,
        totalVenta: item.totalVenta,
      }));
      setVenta(ventasTransformadas);
    }catch (error){
      console.error("Error al cargar ventas:", error);
    }
  }

const filtrados = venta.filter((vta) =>
  String(vta.nVenta).includes(busqueda) ||
  vta.detalleVenta.some((det:DetalleVenta) =>
    String(det.idArticulo).includes(busqueda)
  )
);

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    setArticuloSeleccionado((prev) =>
      prev.map((a) =>
        a.idArticulo === id
          ? { ...a, cantidadArticulo: Math.min(Math.max(nuevaCantidad, 1), a.stockActual ?? 0) }
          : a
      )
    );
  };

  const eliminarArticulo = (id: number) => {
    setArticuloSeleccionado((prev) => prev.filter((a) => a.idArticulo !== id));
  };

  const confirmarVenta = async () => {
    if (articuloSeleccionado.length === 0) {
      setMensaje("❌ Debes seleccionar al menos un artículo.");
      return;
    }

    const sinStock = articuloSeleccionado.find(
      (a) => a.cantidadArticulo > (a.stockActual ?? 0)
    );
    if (sinStock) {
      setMensaje(`❌ No hay suficiente stock para ${sinStock.nombreArticulo}`);
      return;
    }

    const ventaPayload = {
      descripcionVenta: "Venta simulada desde frontend",
      detalles: articuloSeleccionado.map((a) => ({
        idArticulo: a.idArticulo,
        cantidadArticulo: a.cantidadArticulo,
      })),
    };

    try {
      const res = await fetch("http://localhost:5000/api/Ventas/crear-venta", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ventaPayload),
      });

      if (!res.ok) throw new Error("Error al crear la venta");

      const data = await res.json();
      setMensaje(`✅ Venta registrada correctamente. N° Venta: ${data.venta.nVenta}`);
      setArticuloSeleccionado([]);
      obtenerVentas();
    }  catch (error: unknown) {
  if (error instanceof Error) {
    setMensaje("❌ Error al registrar la venta: " + error.message);
  } else {
    setMensaje("❌ Error inesperado");
  }
}
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:'40% 60%',height:'50vh',width:'100%'}}>
    <div className="text-white mt-12 mx-6 " style={{gridColumn:'1/2' }}>
      <h1 className="text-3xl font-bold mb-6">Simulación de Venta</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <label className="text-sm">Agregar artículo:</label>
        <select
          className="bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2"
          onChange={(e) => {
            const id = parseInt(e.target.value);
            if (!isNaN(id)) agregarArticulo(id);
          }}
        >
          <option value="">-- Elegí un artículo --</option>
          {articulos
            .filter((a) => !articuloSeleccionado.some((sel) => sel.idArticulo === a.idArticulo))
            .map((a) => (
              <option key={a.idArticulo} value={a.idArticulo}>
                {a.nombreArticulo} (Stock: {a.stockActual})
              </option>
            ))}
        </select>

        {articuloSeleccionado.map((a) => (
          <div key={a.idArticulo} className="bg-zinc-800 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <strong>{a.nombreArticulo}</strong>
              <button
                className="text-red-500 hover:text-red-700 text-sm"
                onClick={() => eliminarArticulo(a.idArticulo ?? 0)}
              >
                Quitar
              </button>
            </div>

            <label className="text-sm">Cantidad:</label>
            <input
              type="number"
              min={1}
              max={a.stockActual}
              value={a.cantidadArticulo ?? 1}
              onChange={(e) => {
    const nuevaCantidad = parseInt(e.target.value);
    actualizarCantidad(a.idArticulo!, isNaN(nuevaCantidad) ? 1 : nuevaCantidad);
  }}
              className="bg-zinc-700 border border-zinc-600 rounded-md px-3 py-1 w-full"
            />
          </div>
        ))}

        <button
          onClick={confirmarVenta}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md mt-2"
        >
          Confirmar Venta
        </button>

        {mensaje && <p className="mt-4 text-sm">{mensaje}</p>}
      </div>

    </div>
    <div className="text-white mt-16 mr-4" style={{display:'grid',width:'100%',gridColumn:'2/3'}}>
    <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-zinc-900 text-zinc-300">
                <tr>
                  <th className="px-1 py-1 border">Número de Venta</th>
                  <th className="px-2 py-1 border">Descripcion Venta</th>
                  <th className="px-2 py-1 border">Total Venta</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((vta:Ventas) => {
                 
                  return (
                    <tr key={vta.nVenta} className="hover:bg-zinc-800">

                      <td className="px-2 py-1 border">{vta.nVenta}</td>
                      <td className="px-2 py-1 border">{vta.descripcionVenta}</td>
                      <td className="px-2 py-1 border">${vta.totalVenta}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
    </div>
    </div>
  );
}