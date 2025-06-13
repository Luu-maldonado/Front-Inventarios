"use client";

import { useEffect, useState } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCalculator,
} from "react-icons/fa";
import Modal from "@/app/components/Modal";

interface Articulo {
  idArticulo: number
  nombreArticulo: string
  descripcionArticulo: string
  demandaAnual: number
  costoAlmacenaje: number
  costoPedido: number
  costoCompra: number
  modeloInventario: {
    idModeloInventario: number
    nombreModelo: string
  }
  proveedorPredeterminado: {
    idProveedor: number
    nombreProveedor: string
    tipoProveedor: string
  }
  stock: {
    stockSeguridad: number
    stockActual: number
    fechaStockInicio: string
    fechaStockFin: string | null
  }
  estado: string
  fechaBaja: string | null
}


export default function Articulos() {
  const [busqueda, setBusqueda] = useState("");
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const FaSearchIcon = FaSearch as unknown as React.FC<{ className?: string }>
  const [modalEditar, setModalEditar] = useState<Articulo | null>(null);
  const [modalEliminar, setModalEliminar] = useState<Articulo | null>(null);
  const [modalCalculo, setModalCalculo] = useState<Articulo | null>(null);
  const [modalAgregar, setModalAgregar] = useState<boolean>(false);


  useEffect(() => {
    fetch("/mock-data/lista_de_articulos.json")
      .then((res) => res.json())
      .then((data) => setArticulos(data.articulos));
  }, []);

  const filtrados = articulos.filter((art) =>
    art.nombreArticulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const handleAgregar = (nuevo: Articulo) => {
  setArticulos((prev) => [...prev, nuevo]);
  setModalAgregar(false);
};


  return (
    <div className="text-white px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Artículos</h1>

      <div className="flex items-center mb-6">
        <div className="relative w-full max-w-md">
          <FaSearchIcon className="absolute left-3 top-3 text-yellow-300" />
          <input
            type="text"
            placeholder="Buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="pl-10 pr-4 py-2 w-full rounded-md bg-black border border-gray-600 text-white focus:outline-none"
          />
        </div>
        <button onClick={() => setModalAgregar(true)} className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90">
          AGREGAR
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-zinc-900 text-zinc-300">
            <tr>
              <th className="px-3 py-2 border border-gray-700">ID</th>
              <th className="px-3 py-2 border border-gray-700">Producto</th>
              <th className="px-3 py-2 border border-gray-700">Descripción</th>
              <th className="px-3 py-2 border border-gray-700">Demanda</th>
              <th className="px-3 py-2 border border-gray-700">Costo Almac.</th>
              <th className="px-3 py-2 border border-gray-700">Costo Pedido</th>
              <th className="px-3 py-2 border border-gray-700">Costo Compra</th>
              <th className="px-3 py-2 border border-gray-700">Proveedor</th>
              <th className="px-3 py-2 border border-gray-700">Modelo Inventario</th>
              <th className="px-3 py-2 border border-gray-700">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((art) => (
              <tr key={art.idArticulo} className="hover:bg-zinc-800">
                <td className="px-3 py-2 border border-gray-700 text-center">{art.idArticulo}</td>
                <td className="px-3 py-2 border border-gray-700">{art.nombreArticulo}</td>
                <td className="px-3 py-2 border border-gray-700">{art.descripcionArticulo}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">{art.demandaAnual}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">${art.costoAlmacenaje}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">${art.costoPedido}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">${art.costoCompra}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">{art.proveedorPredeterminado?.nombreProveedor}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">{art.modeloInventario?.nombreModelo}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">
                  <button onClick={() => setModalEditar(art)} className="mr-2 hover:text-yellow-300">
                    <FaEdit />
                  </button>
                  <button onClick={() => setModalCalculo(art)} className="mr-2 hover:text-cyan-300">
                    <FaCalculator />
                  </button>
                  <button onClick={() => setModalEliminar(art)} className="hover:text-red-500">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAgregar && (
        <Modal title="Agregar Artículo" onClose={() => setModalAgregar(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const nuevo: Articulo = {
                idArticulo: articulos.length + 1,
                nombreArticulo: form.nombreArticulo.value,
                descripcionArticulo: form.descripcionArticulo.value,
                demandaAnual: Number(form.demandaAnual.value),
                costoAlmacenaje: Number(form.costoAlmacenaje.value),
                costoPedido: Number(form.costoPedido.value),
                costoCompra: Number(form.costoCompra.value),
                modeloInventario: {
                  idModeloInventario: 1,
                  nombreModelo: form.modeloInventario.value,
                },
                proveedorPredeterminado: {
                  idProveedor: 1,
                  nombreProveedor: form.proveedor.value,
                  tipoProveedor: "General",
                },
                stock: {
                  stockSeguridad: Number(form.stockSeguridad.value),
                  stockActual: Number(form.stockActual.value),
                  fechaStockInicio: new Date().toISOString(),
                  fechaStockFin: null,
                },
                estado: "activo",
                fechaBaja: null,
              };
              handleAgregar(nuevo);
            }}
            className="space-y-2"
          >
            <input name="nombreArticulo" placeholder="Nombre" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="descripcionArticulo" placeholder="Descripción" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="demandaAnual" type="number" placeholder="Demanda Anual" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoAlmacenaje" type="number" placeholder="Costo Almacenaje" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoPedido" type="number" placeholder="Costo Pedido" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoCompra" type="number" placeholder="Costo Compra" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="proveedor" placeholder="Proveedor" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="modeloInventario" placeholder="Modelo Inventario" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="stockSeguridad" type="number" placeholder="Stock Seguridad" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="stockActual" type="number" placeholder="Stock Actual" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalAgregar(false)} className="bg-zinc-600 px-4 py-2 rounded">
                Cancelar
              </button>
              <button type="submit" className="bg-white text-black px-4 py-2 rounded">
                Confirmar
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal Edición */}
      {modalEditar && (
        <Modal title="Editar Artículo" onClose={() => setModalEditar(null)}>
          <p className="text-sm mb-4 text-gray-400">Aquí puedes editar los datos del producto: <strong>{modalEditar.nombreArticulo}</strong></p>
          {/* Inputs simulados */}
          <input className="w-full mb-2 p-2 rounded bg-zinc-900 border border-zinc-600" defaultValue={modalEditar.descripcionArticulo} />
          <div className="flex justify-end mt-4">
            <button onClick={() => setModalEditar(null)} className="bg-zinc-600 px-4 py-2 rounded mr-2">Cancelar</button>
            <button className="bg-white text-black px-4 py-2 rounded">Confirmar</button>
          </div>
        </Modal>
      )}

      {/* Modal Eliminación */}
      {modalEliminar && (
        <Modal title="Eliminar Artículo" onClose={() => setModalEliminar(null)}>
          <p className="mb-4"> ¿Desea eliminar el artículo <strong>{modalEliminar.nombreArticulo}</strong>?</p>
          <div className="flex justify-end">
            <button onClick={() => setModalEliminar(null)} className="bg-zinc-600 px-4 py-2 rounded mr-2">Cancelar</button>
            <button className="bg-white text-black px-4 py-2 rounded">Aceptar</button>
          </div>
        </Modal>
      )}

      {/* Modal Cálculo */}
      {modalCalculo && (
        <Modal title="Cálculo Modelo Inventario" onClose={() => setModalCalculo(null)}>
          <p className="mb-4 text-gray-400">Resultado de cálculo para <strong>{modalCalculo.nombreArticulo}</strong></p>
          <p>Lote Óptimo: <strong>???</strong></p>
          <p>Punto de Pedido: <strong>???</strong></p>
          <p>Stock Seguridad: <strong>{modalCalculo.stock?.stockSeguridad}</strong></p>
        </Modal>
      )}
    </div>
  );
}
