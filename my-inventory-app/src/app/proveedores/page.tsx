// src/app/proveedores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FaUserTie, FaTrashAlt, FaEdit } from "react-icons/fa";
import Modal from "@/app/components/Modal";

interface Proveedor {
  idProveedor: number;
  nombreProveedor: string;
  direccion?: string;
  mail?: string;
  telefono?: string;
  masterArticulo?: number;
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
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);


  useEffect(() => {
    fetch("http://localhost:5000/Proveedor/activos")
      .then((res) => res.json())
      .then((data) => {
        console.log("Proveedores desde el back:", data);
        const proveedoresAdaptados = data.map((prov: any) => ({
          idProveedor: prov.idProveedor,
          nombreProveedor: prov.nombreProveedor,
          direccion: prov.direccion,
          mail: prov.mail,
          telefono: prov.telefono,
          masterArticulo: prov.masterArticulo,
          articulos: [],
        }));
        setProveedores(proveedoresAdaptados);
      })
      .catch((err) => console.error("Error cargando proveedores:", err));
  }, []);

  const proveedoresFiltrados = proveedores.filter((p) =>
    p.nombreProveedor.toLowerCase().includes(filtro.toLowerCase()) ||
    p.idProveedor.toString().includes(filtro)
  );

  useEffect(() => {
    fetch("http://localhost:5000/MaestroArticulos/articulos/list-art-datos")
      .then((res) => res.json())
      .then((data) => {
        const articulosAdaptados = data.map((art: any) => ({
          idArticulo: art.idArticulo,
          nombreArticulo: art.nombreArticulo,
        }));
        setArticulos(articulosAdaptados);
      })
      .catch((err) => console.error("Error cargando artículos:", err));
  }, []);

  const articulosFiltrados = articulos.filter((art) =>
    art.nombreArticulo.toLowerCase().includes(filtroArticulo.toLowerCase())
  );

  const toggleArticulo = (idArticulo: number) => {
  if (!proveedorSeleccionado) return;

  const yaSeleccionado = proveedorSeleccionado.articulos.includes(idArticulo);
  const nuevosArticulos = yaSeleccionado
    ? proveedorSeleccionado.articulos.filter((id) => id !== idArticulo)
    : [...proveedorSeleccionado.articulos, idArticulo];

  setProveedorSeleccionado({ ...proveedorSeleccionado, articulos: nuevosArticulos });
};

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
            setProveedorSeleccionado({ idProveedor: 0, nombreProveedor: "", direccion: "", mail: "", telefono: "", articulos: [] });
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
                    setModalEditarAbierto(true);
                  }}
                  className="text-blue-500 hover:text-blue-400"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={async () => {
                    const confirmar = confirm("¿Estás seguro de que querés eliminar este proveedor?");
                    if (!confirmar) return;

                    try {
                      const res = await fetch(`http://localhost:5000/Proveedor/eliminar/${prov.idProveedor}`, {
                        method: "DELETE",
                      });

                      if (!res.ok) throw new Error("Error al eliminar proveedor");

                      alert("Proveedor eliminado correctamente");
                      setProveedores((prev) => prev.filter((p) => p.idProveedor !== prov.idProveedor));
                    } catch (err) {
                      console.error("Error al eliminar proveedor:", err);
                      alert("Ocurrió un error al eliminar el proveedor");
                    }
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mt-1">ID: {prov.idProveedor}</p>
            {prov.direccion && <p className="text-zinc-400 text-sm">Dirección: {prov.direccion}</p>}
            {prov.mail && <p className="text-zinc-400 text-sm">Email: {prov.mail}</p>}
            {prov.telefono && <p className="text-zinc-400 text-sm">Teléfono: {prov.telefono}</p>}
          </div>
        ))}
      </div>

      {proveedorSeleccionado && (
        <Modal open={modalAbierto} onClose={() => {
          setModalAbierto(false);
          setProveedorSeleccionado(null);
        }}>
          <div className="text-white p-4">
            <h2 className="text-xl font-bold mb-4">Agregar Proveedor</h2>
            <input
              placeholder="Nombre del proveedor"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.nombreProveedor}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, nombreProveedor: e.target.value })
              }
            />
            <input
              placeholder="Dirección"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.direccion}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, direccion: e.target.value })
              }
            />
            <input
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.mail}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, mail: e.target.value })
              }
            />
            <input
              placeholder="Teléfono"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.telefono}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, telefono: e.target.value })
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
                onClick={async () => {
                  if (!proveedorSeleccionado || proveedorSeleccionado.articulos.length === 0) {
                    alert("Debe seleccionar al menos un artículo");
                    return;
                  }

                  const confirmar = confirm("¿Deseás guardar los cambios del proveedor?");
                  if (!confirmar) return;

                  const body = {
                    proveedor: {
                      nombreProveedor: proveedorSeleccionado.nombreProveedor,
                      direccion: proveedorSeleccionado.direccion,
                      mail: proveedorSeleccionado.mail,
                      telefono: proveedorSeleccionado.telefono,
                      masterArticulo: proveedorSeleccionado.masterArticulo,
                    },
                    articulos: proveedorSeleccionado.articulos.map((id) => ({
                      idArticulo: id,
                      precioUnitario: 100.0,
                      tiempoEntregaDias: 30,
                      fechaFinProveedorArticulo: null,
                      costoPedido: 0,
                    })),
                  };

                  try {
                    const res = await fetch("http://localhost:5000/Proveedor/crea-prov-art", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    });

                    if (!res.ok) throw new Error("Error en la creación");

                    alert("Proveedor creado correctamente");
                    setModalAbierto(false);
                    setProveedorSeleccionado(null);
                    // podés actualizar la lista si querés
                  } catch (err) {
                    console.error("Error al crear proveedor:", err);
                    alert("Ocurrió un error al crear el proveedor");
                  }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {modalEditarAbierto && proveedorSeleccionado && (
        <Modal open={modalEditarAbierto} onClose={() => {
          setModalEditarAbierto(false);
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
              placeholder="Dirección"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.direccion}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, direccion: e.target.value })
              }
            />
            <input
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.mail}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, mail: e.target.value })
              }
            />
            <input
              placeholder="Teléfono"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.telefono}
              onChange={(e) =>
                setProveedorSeleccionado({ ...proveedorSeleccionado, telefono: e.target.value })
              }
            />

            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-700"
                onClick={() => {
                  setModalEditarAbierto(false);
                  setProveedorSeleccionado(null);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  const confirmar = confirm("¿Deseás guardar los cambios?");
                  if (!confirmar) return;

                  try {
                    const res = await fetch(`http://localhost:5000/Proveedor/actualizar/${proveedorSeleccionado.idProveedor}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        nombreProveedor: proveedorSeleccionado.nombreProveedor,
                        direccion: proveedorSeleccionado.direccion,
                        mail: proveedorSeleccionado.mail,
                        telefono: proveedorSeleccionado.telefono,
                      }),
                    });

                    if (!res.ok) throw new Error("Error al actualizar proveedor");

                    alert("Proveedor actualizado correctamente");
                    setModalEditarAbierto(false);
                    setProveedorSeleccionado(null);
                    window.location.reload(); // o actualizá la lista localmente si preferís
                  } catch (err) {
                    console.error("Error al actualizar proveedor:", err);
                    alert("Ocurrió un error al actualizar el proveedor");
                  }
                }}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
