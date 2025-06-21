"use client";

import { useEffect, useState } from "react";

interface Articulo {
  idArticulo: number;
  nombreArticulo: string;
  costoCompra: number;
  stock: {
    stockActual: number;
  };
  estado: string;
}

export default function Ventas() {
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [articuloSeleccionado, setArticuloSeleccionado] = useState<Articulo | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    fetch("/mock-data/lista_de_articulos.json")
      .then((res) => res.json())
      .then((data) => {
        const activos = data.articulos.filter((a: Articulo) => a.estado === "activo");
        setArticulos(activos);
      })
      .catch((err) => console.error("Error cargando artículos:", err));
  }, []);

  const total =
    articuloSeleccionado && cantidad > 0
      ? articuloSeleccionado.costoCompra * cantidad
      : 0;

  const confirmarVenta = () => {
    if (!articuloSeleccionado) return;

    if (cantidad > articuloSeleccionado.stock.stockActual) {
      setMensaje("❌ No hay suficiente stock disponible.");
      return;
    }

    setMensaje(
      `✅ Venta confirmada: ${cantidad} x ${articuloSeleccionado.nombreArticulo} = $${total.toFixed(2)}`
    );
  };

  return (
    <div className="text-white mt-12 mx-6">
      <h1 className="text-3xl font-bold mb-8">Simulación de Venta</h1>

      <div className="flex flex-col gap-4 max-w-md">
        <label className="text-sm">Seleccionar artículo:</label>
        <select
          className="bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2"
          onChange={(e) => {
            const id = parseInt(e.target.value);
            const art = articulos.find((a) => a.idArticulo === id) || null;
            setArticuloSeleccionado(art);
            setCantidad(1);
            setMensaje("");
          }}
        >
          <option value="">-- Elegí un artículo --</option>
          {articulos.map((a) => (
            <option key={a.idArticulo} value={a.idArticulo}>
              {a.nombreArticulo} (Stock: {a.stock.stockActual}, Precio: ${a.costoCompra})
            </option>
          ))}
        </select>

        {articuloSeleccionado && (
          <>
            <label className="text-sm">Cantidad:</label>
            <input
              type="number"
              min={1}
              max={articuloSeleccionado.stock.stockActual}
              value={cantidad}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val) || val < 1) val = 1;
                if (val > articuloSeleccionado.stock.stockActual)
                  val = articuloSeleccionado.stock.stockActual;
                setCantidad(val);
              }}
              className="bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2"
            />

            <p>Total: <strong>${total.toFixed(2)}</strong></p>

            <button
              onClick={confirmarVenta}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md mt-4"
            >
              Confirmar Venta
            </button>
          </>
        )}

        {mensaje && <p className="mt-4 text-sm">{mensaje}</p>}
      </div>
    </div>
  );
}
