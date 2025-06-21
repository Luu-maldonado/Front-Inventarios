// src/app/proveedores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FaUserTie, FaTrashAlt, FaEdit} from "react-icons/fa";
import Modal from "@/app/components/Modal";

interface Proveedor {
  idProveedor: number;
  nombreProveedor: string;
  tipoProveedor: string;
  articulos: number[];
}

interface Articulo {
  idArticulo: number;
  nombreArticulo: string;
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [filtro, setFiltro] = useState("");
  const [filtroArticulo, setFiltroArticulo] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  useEffect(() => {
    fetch("/mock-data/proveedores.json")
      .then((res) => res.json())
      .then((data) => setProveedores(data.proveedores));

    fetch("/mock-data/lista_de_articulos.json")
      .then((res) => res.json())
      .then((data) => setArticulos(data.articulos));
  }, []);

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombreProveedor.toLowerCase().includes(filtro.toLowerCase()) ||
    p.idProveedor.toString().includes(filtro)
  );

  const toggleArticulo = (idArticulo: number) => {
    if (!proveedorSeleccionado) return;
    const yaTiene = proveedorSeleccionado.articulos.includes(idArticulo);
    const nuevos = yaTiene
      ? proveedorSeleccionado.articulos.filter((id) => id !== idArticulo)
      : [...proveedorSeleccionado.articulos, idArticulo];
    setProveedorSeleccionado({ ...proveedorSeleccionado, articulos: nuevos });
  };

  const articulosFiltrados = articulos.filter((art) =>
    art.nombreArticulo.toLowerCase().includes(filtroArticulo.toLowerCase())
  );

  return (
    <div className="text-white mt-12 mx-6">
      <h1 className="text-3xl font-bold mb-8">Gestión de Proveedores</h1>

      <div className="flex items-center gap-4 mb-8">
        <input
          placeholder="Buscar por nombre o ID"
          className="max-w-sm px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button
          onClick={() => {
            setProveedorSeleccionado({ idProveedor: Date.now(), nombreProveedor: "", tipoProveedor: "", articulos: [] });
            setModalAbierto(true);
          }}
          className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90"
        >
          Agregar proveedor
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {proveedoresFiltrados.map((prov) => (
          <div
            key={prov.idProveedor}
            className="border border-zinc-700 p-4 rounded-xl bg-zinc-800 shadow hover:shadow-lg transition"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaUserTie /> {prov.nombreProveedor}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setProveedorSeleccionado(prov);
                    setModalAbierto(true);
                  }}
                  className="text-blue-500 hover:text-blue-400"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Estás seguro de que querés eliminar este proveedor?")) {
                      setProveedores((prev) => prev.filter((p) => p.idProveedor !== prov.idProveedor));
                    }
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mt-1">ID: {prov.idProveedor}</p>
            <p className="text-zinc-400 text-sm">Tipo: {prov.tipoProveedor}</p>
            <p className="text-zinc-400 text-sm mt-2">Artículos: {prov.articulos.length}</p>
          </div>
        ))}
      </div>

      {proveedorSeleccionado && (
        <Modal open={modalAbierto} onClose={() => {
          setModalAbierto(false);
          setProveedorSeleccionado(null);
        }}>
          <div className="text-white p-4">
            <h2 className="text-xl font-bold mb-4">Editar Proveedor</h2>
            <input
              placeholder="Nombre del proveedor"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.nombreProveedor}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, nombreProveedor: e.target.value })
              }
            />
            <input
              placeholder="Tipo de proveedor"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.tipoProveedor}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, tipoProveedor: e.target.value })
              }
            />
            <h3 className="font-semibold mt-2 mb-1">Filtrar artículos:</h3>
            <input
              placeholder="Buscar artículo"
              className="w-full px-3 py-2 mb-2 rounded-md bg-zinc-800 border border-zinc-600"
              value={filtroArticulo}
              onChange={(e) => setFiltroArticulo(e.target.value)}
            />
            <h3 className="font-semibold mt-2">Seleccioná los artículos:</h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {articulosFiltrados.map((art) => (
                <label key={art.idArticulo} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={proveedorSeleccionado.articulos.includes(art.idArticulo)}
                    onChange={() => toggleArticulo(art.idArticulo)}
                  />
                  <span>{art.nombreArticulo}</span>
                </label>
              ))}
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-700"
                onClick={() => {
                  setModalAbierto(false);
                  setProveedorSeleccionado(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700"
                onClick={() => {
                  if (proveedorSeleccionado.articulos.length === 0) {
                    alert("Debe seleccionar al menos un artículo");
                    return;
                  }
                  const confirmar = confirm("¿Deseás guardar los cambios del proveedor?");
                  if (!confirmar) return;

                  const index = proveedores.findIndex((p) => p.idProveedor === proveedorSeleccionado.idProveedor);
                  const nuevos = [...proveedores];
                  if (index >= 0) {
                    nuevos[index] = proveedorSeleccionado;
                  } else {
                    nuevos.push(proveedorSeleccionado);
                  }
                  setProveedores(nuevos);
                  setModalAbierto(false);
                  setProveedorSeleccionado(null);
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
