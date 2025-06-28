"use client";

import { useEffect, useState } from "react";

interface Articulo {
  idArticulo: number;
  nombreArticulo: string;
  costoAlmacen: number;
  stockActual: number;
}

interface ArticuloSeleccionado extends Articulo {
  cantidadArticulo: number;
}

export default function Ventas() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<ArticuloSeleccionado[]>([]);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/MaestroArticulos/articulos/list-art-datos")
      .then((res) => res.json())
      .then((data) => {
        const activos = data.filter((a: any) => a.stockActual > 0); 
        const transformados = activos.map((a: any) => ({
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

  const actualizarCantidad = (id: number, nuevaCantidad: number) => {
    setArticuloSeleccionado((prev) =>
      prev.map((a) =>
        a.idArticulo === id
          ? { ...a, cantidadArticulo: Math.min(Math.max(nuevaCantidad, 1), a.stockActual) }
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
      (a) => a.cantidadArticulo > a.stockActual
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
    } catch (error: any) {
      setMensaje("❌ Error al registrar la venta: " + error.message);
    }
  };

  return (
    <div className="text-white mt-12 mx-6 ">
      <h1 className="text-3xl font-bold mb-6">Simulación de Venta</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <label className="text-sm">Seleccionar artículo:</label>
        <select
          className="bg-zinc-800 border border-zinc-800 rounded-md px-1 py-3"
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
                onClick={() => eliminarArticulo(a.idArticulo)}
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
    actualizarCantidad(a.idArticulo, isNaN(nuevaCantidad) ? 1 : nuevaCantidad);
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
  );
}