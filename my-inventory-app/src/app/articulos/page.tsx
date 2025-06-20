"use client";

import { useEffect, useState } from "react";
import {
  FaSearch,
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
    stockActual: number;
    stockSeguridad: number;
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
  const [modalAgregar, setModalAgregar] = useState<boolean>(false);
  const [modelosInventario, setModelosInventario] = useState<{ idModeloInventario: number, nombreModelo: string }[]>([]);
  const [proveedores, setProveedores] = useState<{ idProveedor: number, nombreProveedor: string }[]>([]);
  const [modalStock, setModalStock] = useState<boolean>(false);
  const [modalCalculoGlobal, setModalCalculoGlobal] = useState(false);
  const [calculosInventario, setCalculosInventario] = useState<
    { idArticulo: number; nombreArticulo: string; loteFijo: number; intervaloFijo: number }[]
  >([]);
  const [busquedaCalculo, setBusquedaCalculo] = useState("");
  const [busquedaStock, setBusquedaStock] = useState("");



  useEffect(() => {
    fetch("/mock-data/lista_de_articulos.json")
      .then((res) => res.json())
      .then((data) => setArticulos(data.articulos));
  }, []);

  const filtrados = articulos.filter((art) =>
    art.nombreArticulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    art.descripcionArticulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(art.idArticulo).includes(busqueda)
  );


  const handleAgregar = (nuevo: Articulo) => {
    setArticulos((prev) => [...prev, nuevo]);
    setModalAgregar(false);
  };
  useEffect(() => {
    fetch("/mock-data/lista_de_articulos.json")
      .then((res) => res.json())
      .then((data) => setArticulos(data.articulos));

    fetch("/mock-data/modelos_inventario.json")
      .then((res) => res.json())
      .then((data) => setModelosInventario(data.modelos)); // ← debe tener { idModeloInventario, nombreModelo }

    fetch("/mock-data/proveedores.json")
      .then((res) => res.json())
      .then((data) => setProveedores(data.proveedores)); // ← debe tener { idProveedor, nombreProveedor }
  }, []);

  const handleEditar = (articuloEditado: Articulo) => {
    setArticulos(prev =>
      prev.map((art) =>
        art.idArticulo === articuloEditado.idArticulo ? articuloEditado : art
      )
    );
    setModalEditar(null);
  };

  const handleEliminar = (id: number) => {
    setArticulos((prev) => prev.filter((art) => art.idArticulo !== id));
    setModalEliminar(null);
  };

  const cargarCalculos = async () => {
    try {
      const res = await fetch("/mock-data/calculos_inventarios.json"); // <-- ajustá a tu endpoint real
      const data = await res.json();
      setCalculosInventario(data.calculos); // estructura esperada: [{ idArticulo, nombreArticulo, loteFijo, intervaloFijo }]
      setModalCalculoGlobal(true);
    } catch (error) {
      console.error("Error al cargar cálculos:", error);
    }
  };
  const calculosFiltrados = calculosInventario.filter((item) =>
    item.nombreArticulo.toLowerCase().includes(busquedaCalculo.toLowerCase()) ||
    String(item.idArticulo).includes(busquedaCalculo)
  );

  const articulosFiltradosStock = articulos.filter((art) =>
    art.nombreArticulo.toLowerCase().includes(busquedaStock.toLowerCase()) ||
    String(art.idArticulo).includes(busquedaStock)
  );

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
          AGREGAR ARTICULO
        </button>
        <button
          onClick={cargarCalculos}
          className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90"
        >
          <FaCalculator />
        </button>
        <button
          onClick={() => setModalStock(true)}
          className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90"
        >
          MANEJO DE STOCK
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
                  <button onClick={() => setModalEliminar(art)} className="hover:text-red-500">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Agregar */}
      {modalAgregar && (
        <Modal title="Agregar Artículo" onClose={() => setModalAgregar(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const idProveedor = Number(form.idProveedor.value);
              const proveedorSeleccionado = proveedores.find((p) => p.idProveedor === idProveedor);
              const idModeloInventario = Number(form.idModeloInventario.value);
              const modeloSeleccionado = modelosInventario.find((m) => m.idModeloInventario === idModeloInventario);
              const nuevo: Articulo = {
                idArticulo: articulos.length + 1,
                nombreArticulo: form.nombreArticulo.value,
                descripcionArticulo: form.descripcionArticulo.value,
                demandaAnual: Number(form.demandaAnual.value),
                costoAlmacenaje: Number(form.costoAlmacenaje.value),
                costoPedido: Number(form.costoPedido.value),
                costoCompra: Number(form.costoCompra.value),
                modeloInventario: {
                  idModeloInventario: modeloSeleccionado!.idModeloInventario,
                  nombreModelo: modeloSeleccionado!.nombreModelo,
                },
                proveedorPredeterminado: {
                  idProveedor: proveedorSeleccionado!.idProveedor,
                  nombreProveedor: proveedorSeleccionado!.nombreProveedor,
                  tipoProveedor: "General",
                },
                stock: {
                  stockActual: 0,
                  stockSeguridad: 0
                },

                estado: "activo",
                fechaBaja: null,
              };
              if (window.confirm("¿Confirmás que querés agregar este artículo?")) {
                handleAgregar(nuevo);
              }

            }}
            className="space-y-2"
          >
            <input name="nombreArticulo" placeholder="Nombre" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="descripcionArticulo" placeholder="Descripción" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="demandaAnual" type="number" placeholder="Demanda Anual" min={0} max={10000} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoAlmacenaje" type="number" placeholder="Costo Almacenaje" min={0} max={10000} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoPedido" type="number" placeholder="Costo Pedido" min={0} max={10000} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoCompra" type="number" placeholder="Costo Compra" min={0} max={10000} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <select name="idProveedor" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required>
              <option value="">Seleccionar Proveedor</option>
              {proveedores.map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>{p.nombreProveedor}</option>
              ))}
            </select>
            <select name="idModeloInventario" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required>
              <option value="">Seleccionar Modelo de Inventario</option>
              {modelosInventario.map((m) => (
                <option key={m.idModeloInventario} value={m.idModeloInventario}>{m.nombreModelo}</option>
              ))}
            </select>
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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;

              const idProveedor = Number(form.idProveedor.value);
              const proveedorSeleccionado = proveedores.find((p) => p.idProveedor === idProveedor);

              const idModeloInventario = Number(form.idModeloInventario.value);
              const modeloSeleccionado = modelosInventario.find((m) => m.idModeloInventario === idModeloInventario);

              const articuloEditado: Articulo = {
                idArticulo: modalEditar.idArticulo, // NO SE MODIFICA
                nombreArticulo: form.nombreArticulo.value,
                descripcionArticulo: form.descripcionArticulo.value,
                demandaAnual: Number(form.demandaAnual.value),
                costoAlmacenaje: Number(form.costoAlmacenaje.value),
                costoPedido: Number(form.costoPedido.value),
                costoCompra: Number(form.costoCompra.value),
                modeloInventario: {
                  idModeloInventario: modeloSeleccionado!.idModeloInventario,
                  nombreModelo: modeloSeleccionado!.nombreModelo,
                },
                proveedorPredeterminado: {
                  idProveedor: proveedorSeleccionado!.idProveedor,
                  nombreProveedor: proveedorSeleccionado!.nombreProveedor,
                  tipoProveedor: "General",
                },
                stock: {
                  stockActual: 0,
                  stockSeguridad: 0
                },

                estado: modalEditar.estado,
                fechaBaja: modalEditar.fechaBaja,
              };

              if (window.confirm("¿Guardar los cambios de este artículo?")) {
                handleEditar(articuloEditado);
              }
            }}
            className="space-y-2"
          >
            <input value={modalEditar.idArticulo} disabled className="w-full p-2 bg-zinc-700 border border-zinc-600 rounded text-gray-400" />
            <input name="nombreArticulo" defaultValue={modalEditar.nombreArticulo} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="descripcionArticulo" defaultValue={modalEditar.descripcionArticulo} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="demandaAnual" type="number" defaultValue={modalEditar.demandaAnual} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoAlmacenaje" type="number" defaultValue={modalEditar.costoAlmacenaje} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoPedido" type="number" defaultValue={modalEditar.costoPedido} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoCompra" type="number" defaultValue={modalEditar.costoCompra} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />

            <select name="idProveedor" defaultValue={modalEditar.proveedorPredeterminado.idProveedor} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required>
              <option value="">Seleccionar Proveedor</option>
              {proveedores.map((p) => (
                <option key={p.idProveedor} value={p.idProveedor}>{p.nombreProveedor}</option>
              ))}
            </select>

            <select name="idModeloInventario" defaultValue={modalEditar.modeloInventario.idModeloInventario} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required>
              <option value="">Seleccionar Modelo de Inventario</option>
              {modelosInventario.map((m) => (
                <option key={m.idModeloInventario} value={m.idModeloInventario}>{m.nombreModelo}</option>
              ))}
            </select>


            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalEditar(null)} className="bg-zinc-600 px-4 py-2 rounded">
                Cancelar
              </button>
              <button type="submit" className="bg-white text-black px-4 py-2 rounded">
                Guardar cambios
              </button>
            </div>
          </form>
        </Modal>
      )}
      {/* Modal Eliminación */}
      {modalEliminar && (
        <Modal title="Eliminar Artículo" onClose={() => setModalEliminar(null)}>
          <p className="mb-4">¿Desea eliminar el artículo <strong>{modalEliminar.nombreArticulo}</strong>?</p>
          <div className="flex justify-end">
            <button onClick={() => setModalEliminar(null)} className="bg-zinc-600 px-4 py-2 rounded mr-2">Cancelar</button>
            <button
              onClick={() => handleEliminar(modalEliminar.idArticulo)}
              className="bg-white text-black px-4 py-2 rounded"
            >
              Aceptar
            </button>
          </div>
        </Modal>
      )}
      {/* Modal Cálculo */}
      {modalCalculoGlobal && (
        <Modal title="Cálculo de Modelos de Inventario" onClose={() => setModalCalculoGlobal(false)}>
          <div className="text-sm text-white space-y-4 max-h-[70vh] overflow-y-auto">
            <input
              type="text"
              placeholder="Buscar por ID o nombre"
              value={busquedaCalculo}
              onChange={(e) => setBusquedaCalculo(e.target.value)}
              className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-600 rounded text-white"
            />
            {calculosFiltrados.map((item) => (
              <div key={item.idArticulo} className="border-b border-zinc-600 pb-2">
                <h3 className="font-bold text-yellow-300 mb-1">{item.nombreArticulo}</h3>
                <p>Lote Fijo (EOQ): <strong>{item.loteFijo}</strong> unidades</p>
                <p>Intervalo Fijo: <strong>{item.intervaloFijo}</strong> días</p>
              </div>
            ))}
            {calculosFiltrados.length === 0 && (
              <p className="text-gray-400">No se encontraron cálculos.</p>
            )}
          </div>
        </Modal>
      )}

      {/* Modal Stock */}
      {modalStock && (
        <Modal title="Manejo de Stock" onClose={() => setModalStock(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const nuevos = [...articulos];

              nuevos.forEach((art, index) => {
                const stockActual = Number(form[`stockActual_${index}`].value);
                const stockSeguridad = Number(form[`stockSeguridad_${index}`].value);
                if (!isNaN(stockActual)) art.stock.stockActual = stockActual;
                if (!isNaN(stockSeguridad)) art.stock.stockSeguridad = stockSeguridad;
              });

              if (window.confirm("¿Confirmás los cambios en el stock?")) {
                setArticulos(nuevos);
                setModalStock(false);
              }

            }}
            className="space-y-4"
          >
            <input
              type="text"
              placeholder="Buscar artículo por ID o nombre"
              value={busquedaStock}
              onChange={(e) => setBusquedaStock(e.target.value)}
              className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-600 rounded text-white"
            />
            {articulosFiltradosStock.map((art, index) => (
              <div key={art.idArticulo} className="border-b border-zinc-600 pb-2">
                <h4 className="font-semibold text-white">{art.nombreArticulo}</h4>
                <div className="flex gap-2">
                  <input
                    name={`stockActual_${index}`}
                    type="number"
                    min={0}
                    defaultValue={art.stock?.stockActual || 0}
                    placeholder="Stock actual"
                    className="w-1/2 p-2 bg-zinc-800 border border-zinc-600 rounded"
                  />
                  <input
                    name={`stockSeguridad_${index}`}
                    type="number"
                    min={0}
                    defaultValue={art.stock?.stockSeguridad || 0}
                    placeholder="Stock seguridad"
                    className="w-1/2 p-2 bg-zinc-800 border border-zinc-600 rounded"
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setModalStock(false)} className="bg-zinc-600 px-4 py-2 rounded">
                Cancelar
              </button>
              <button type="submit" className="bg-white text-black px-4 py-2 rounded">
                Guardar cambios
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
