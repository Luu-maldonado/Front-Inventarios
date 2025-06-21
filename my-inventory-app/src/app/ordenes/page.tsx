"use client";

import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import Modal from "@/app/components/Modal";

interface OrdenDeCompra {
  idOC: number;
  nombreArticulo: string;
  proveedor: string;
  loteSugerido: number;
  estado: "Pendiente" | "Enviada" | "Finalizada"| "Cancelada";
}

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [ocSeleccionada, setOCSeleccionada] = useState<OrdenDeCompra | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);

  const proveedoresDisponibles = ["Proveedor A", "Proveedor B", "Proveedor C"];
  const ESTADOS_VALIDOS: Record<string, string[]> = {
    Pendiente: ["Enviada"],
    Enviada: ["Finalizada"],
    Finalizada: [],
  };

  useEffect(() => {
    fetch("/mock-data/ordenes_de_compra.json")
      .then((res) => res.json())
      .then((data) => setOrdenes(data.ordenesCompra))
      .catch((err) => {
        console.error("Error al cargar órdenes:", err);
        setOrdenes([]);
      });
  }, []);

  const ordenesFiltradas = ordenes
    .filter(
      (oc) =>
        (oc.nombreArticulo?.toLowerCase().includes(filtro.toLowerCase()) ?? false) ||
        oc.idOC.toString().includes(filtro)
    )
    .filter((oc) => !estadoFiltro || oc.estado === estadoFiltro);

  const cerrarModal = () => {
    setModalAbierto(false);
    setOCSeleccionada(null);
  };

  return (
    <div className="text-white mt-12 mx-6">
      <h1 className="text-3xl font-bold mb-8">Órdenes de Compra</h1>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          placeholder="Buscar por artículo o ID"
          className="max-w-sm px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <select
          className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          value={estadoFiltro}
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Enviada">Enviada</option>
          <option value="Finalizada">Finalizada</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">ID</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">Artículo</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">Proveedor</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">Lote</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">Estado</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700 bg-zinc-800">
            {ordenesFiltradas.map((oc) => (
              <tr key={oc.idOC}>
                <td className="px-4 py-3 text-zinc-200">#{oc.idOC}</td>
                <td className="px-4 py-3 text-zinc-200">{oc.nombreArticulo}</td>
                <td className="px-4 py-3 text-zinc-200">{oc.proveedor}</td>
                <td className="px-4 py-3 text-zinc-200">{oc.loteSugerido}</td>
                <td className="px-4 py-3 text-zinc-200">{oc.estado}</td>
                <td className="px-4 py-3">
                  {oc.estado !== "Finalizada" &&  oc.estado !== "Cancelada" &&(
                    <button
                      className="text-blue-500 hover:text-blue-400"
                      onClick={() => {
                        setOCSeleccionada({ ...oc });
                        setModalAbierto(true);
                      }}
                    >
                      <FaEdit />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {ocSeleccionada && ocSeleccionada.estado !== "Cancelada" &&(
        <Modal open={modalAbierto} onClose={cerrarModal}>
          <div className="text-white p-4">
            <h2 className="text-xl font-bold mb-4">
              Modificar Orden #{ocSeleccionada.idOC}
            </h2>

            <label className="block text-sm mb-1">Proveedor:</label>
            <select
              className="w-full px-4 py-2 mb-3 rounded-md bg-zinc-800 border border-zinc-700"
              value={ocSeleccionada.proveedor}
              onChange={(e) =>
                setOCSeleccionada({ ...ocSeleccionada, proveedor: e.target.value })
              }
            >
              {proveedoresDisponibles.map((prov) => (
                <option key={prov} value={prov}>
                  {prov}
                </option>
              ))}
            </select>

            <label className="block text-sm mb-1">Lote sugerido (1-10.000):</label>
            <input
              type="number"
              min={1}
              max={10000}
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={ocSeleccionada.loteSugerido}
              onChange={(e) => {
                let val = parseInt(e.target.value);
                if (isNaN(val)) val = 1;
                if (val < 1) val = 1;
                if (val > 10000) val = 10000;
                setOCSeleccionada({ ...ocSeleccionada, loteSugerido: val });
              }}
            />

            <label className="block text-sm mb-1">Estado:</label>
            <select
              className="w-full px-4 py-2 mb-3 rounded-md bg-zinc-800 border border-zinc-700"
              value={ocSeleccionada.estado}
              onChange={(e) => {
                const nuevoEstado = e.target.value as OrdenDeCompra["estado"];
                if (nuevoEstado !== ocSeleccionada.estado) {
                  const confirmar = window.confirm(`¿Estás segura que querés cambiar el estado a ${nuevoEstado}?`);
                  if (confirmar) {
                    setOCSeleccionada({ ...ocSeleccionada, estado: nuevoEstado });
                  }
                }
              }}
            >
              <option value={ocSeleccionada.estado}>{ocSeleccionada.estado}</option>
              {ESTADOS_VALIDOS[ocSeleccionada.estado].map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-4 mt-4">
              {ocSeleccionada.estado === "Pendiente" && (
                <button
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    const confirmacion = window.confirm("¿Estás segura que querés eliminar esta orden?");
                    if (confirmacion) {
                      setOrdenes((prev) =>
                        prev.filter((oc) => oc.idOC !== ocSeleccionada.idOC)
                      );
                      cerrarModal();
                    }
                  }}
                >
                  Cancelar OC
                </button>
              )}
              <button
                className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700"
                onClick={() => {
                  const nuevas = ordenes.map((oc) =>
                    oc.idOC === ocSeleccionada.idOC ? ocSeleccionada : oc
                  );
                  setOrdenes(nuevas);
                  cerrarModal();
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
