"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaEye } from "react-icons/fa";
import Modal from "@/app/components/Modal";

interface OrdenDeCompra {
  nOrdenCompra: number;
  fechaOrden: string;
  totalPagar: number;
  proveedor: string;
  idProveedor: number;
  loteSugerido: number;
  estado: string;
}

interface EstadoOrden {
  idOrdenCompraEstado: number;
  nombreEstadoOrden: string;
}

interface Proveedor {
  idProveedor: number;
  nombreProveedor: string;
}

interface DetalleOrden {
  nDetalleOrdenCompra: number;
  cantidadArticulos: number;
  precioSubTotal: number;
  idArticulo: number;
  nombreArticulo: string;
}

export default function Ordenes() {
  const [ordenes, setOrdenes] = useState<OrdenDeCompra[]>([]);
  const [estados, setEstados] = useState<EstadoOrden[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [filtro, setFiltro] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [proveedorFiltro, setProveedorFiltro] = useState("");
  const [ocSeleccionada, setOCSeleccionada] = useState<OrdenDeCompra | null>(
    null
  );
  const [modalAbierto, setModalAbierto] = useState(false);
  const [detalles, setDetalles] = useState<DetalleOrden[]>([]);
  const [modalTipo, setModalTipo] = useState<
    "detalle" | "edicion" | "nueva" | null
  >(null);

 const cargarOrdenes = async () => {
  try {
    const res = await fetch("http://localhost:5000/OrdenCompra/lista-ordenes");
    const data = await res.json();
    setOrdenes(data);
  } catch (err) {
    console.error("Error cargando órdenes:", err);
    setOrdenes([]);
  }
};

useEffect(() => {
  cargarOrdenes();

    fetch("http://localhost:5000/OrdenCompraEstado")
      .then((res) => res.json())
      .then((data) => setEstados(data))
      .catch((err) => {
        console.error("Error al cargar estados:", err);
        setEstados([]);
      });

    fetch("http://localhost:5000/Proveedor/activo")
      .then((res) => res.json())
      .then((data) => setProveedores(data))
      .catch((err) => {
        console.error("Error al cargar proveedores:", err);
        setProveedores([]);
      });
  }, []);

  const ordenesFiltradas = ordenes
    .filter(
      (oc) =>
        (oc.nOrdenCompra?.toString() ?? "").includes(filtro) ||
        (oc.proveedor?.toLowerCase() ?? "").includes(filtro.toLowerCase())
    )
    .filter(
      (oc) =>
        !estadoFiltro ||
        oc.estado?.trim().toLowerCase() === estadoFiltro.trim().toLowerCase()
    )
    .filter(
      (oc) =>
        !proveedorFiltro ||
        oc.proveedor?.trim().toLowerCase() ===
          proveedorFiltro.trim().toLowerCase()
    );

  const cerrarModal = () => {
    setModalAbierto(false);
    setOCSeleccionada(null);
    setDetalles([]);
    setModalTipo(null);
  };
  const abrirModalDetalle = async (orden: OrdenDeCompra) => {
    setOCSeleccionada(orden);
    setModalTipo("detalle");
    setModalAbierto(true);

    try {
      const response = await fetch(
        `http://localhost:5000/OrdenCompra/detalles-orden/${orden.nOrdenCompra}`
      );
      const data = await response.json();
      setDetalles(data);
    } catch (error) {
      console.error("Error al obtener detalles:", error);
      setDetalles([]);
      cargarOrdenes();
    }
  };

  const cargarArticulosDeProveedor = async (idProveedor: number) => {
    try {
      const res = await fetch(
        `http://localhost:5000/Proveedor/articulos-proveedor/${idProveedor}`
      );
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.error("El backend no devolvió un array:", data);
        setDetalles([]);
        cargarOrdenes();
        return;
      }

      const articulosFormateados = data.map((a: DetalleOrden) => ({
        nDetalleOrdenCompra: a.nDetalleOrdenCompra,
        idArticulo: a.idArticulo,
        nombreArticulo: a.nombreArticulo,
        cantidadArticulos: a.cantidadArticulos,
        precioSubTotal: a.precioSubTotal ?? 0,
      }));

      setDetalles(articulosFormateados);
    } catch (err) {
      console.error("Error cargando artículos del proveedor:", err);
      setDetalles([]);
    }
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
          {estados.map((estado) => (
            <option
              key={estado.idOrdenCompraEstado}
              value={estado.nombreEstadoOrden}
            >
              {estado.nombreEstadoOrden}
            </option>
          ))}
        </select>
        <select
          className="px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700"
          value={proveedorFiltro}
          onChange={(e) => setProveedorFiltro(e.target.value)}
        >
          <option value="">Todos los proveedores</option>
          {proveedores.map((prov) => (
            <option key={prov.idProveedor} value={prov.nombreProveedor}>
              {prov.nombreProveedor}
            </option>
          ))}
        </select>
        <button
          className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700"
          onClick={() => {
            setModalAbierto(true);
            setModalTipo("nueva");
            setOCSeleccionada(null);
            setDetalles([]);
          }}
        >
          Nueva Orden
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-700">
        <table className="min-w-full divide-y divide-zinc-700">
          <thead className="bg-zinc-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                ID
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                Proveedor
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                Total
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                Estado
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-zinc-300">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-700 bg-zinc-800">
            {ordenesFiltradas.map((oc) => (
              <tr key={oc.nOrdenCompra}>
                <td className="px-4 py-3 text-zinc-200">#{oc.nOrdenCompra}</td>
                <td className="px-4 py-3 text-zinc-200">
                  {new Date(oc.fechaOrden).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-zinc-200">{oc.proveedor}</td>
                <td className="px-4 py-3 text-zinc-200">${oc.totalPagar}</td>
                <td className="px-4 py-3 text-zinc-200">{oc.estado}</td>
                <td className="px-4 py-3">
                  <button
                    className="text-blue-500 hover:text-blue-400"
                    onClick={() => abrirModalDetalle(oc)}
                  >
                    <FaEye />
                  </button>
                </td>
                <td>
                  {oc.estado !== "Archivada" && oc.estado !== "Cancelada" && (
                    <button
                      className="text-blue-500 hover:text-blue-400"
                      onClick={() => {
                        setOCSeleccionada({ ...oc });
                        setModalAbierto(true);
                        setModalTipo("edicion");
                        cargarArticulosDeProveedor(oc.idProveedor);
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

      {/*Modal detalles*/}

      {modalTipo === "detalle" && (
        <Modal open={modalAbierto} title="Modal detalles" onClose={cerrarModal}>
          <div className="relative text-white p-4 bg-zinc-800 rounded-md max-w-lg mx-auto mt-10">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-white text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4">
              Detalles de la Orden #{ocSeleccionada?.nOrdenCompra}
            </h2>

            {!detalles || detalles.length === 0 ? (
              <p>No hay detalles disponibles.</p>
            ) : (
              <ul className="space-y-2">
                {detalles.map((det) => (
                  <li
                    key={det.nDetalleOrdenCompra}
                    className="border-b border-zinc-600 pb-2"
                  >
                    <p>
                      <strong>ID:</strong> {det.idArticulo}
                    </p>
                    <p>
                      <strong>Artículo:</strong> {det.nombreArticulo}
                    </p>
                    <p>
                      <strong>Cantidad:</strong> {det.cantidadArticulos}
                    </p>
                    <p>
                      <strong>Subtotal:</strong> ${det.precioSubTotal}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Modal>
      )}

      {/*Modal detalles*/}

      {modalTipo === "edicion" && ocSeleccionada && (
        <Modal open={modalAbierto} title="Modal detalles" onClose={cerrarModal}>
          <div className="relative text-white p-6 bg-zinc-800 rounded-md max-w-3xl mx-auto mt-10">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-white text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4">
              Editar Orden #{ocSeleccionada.nOrdenCompra}
            </h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">Proveedor:</label>
              <select
                className="w-full px-4 py-2 rounded-md bg-zinc-700"
                value={ocSeleccionada.idProveedor}
                disabled={ocSeleccionada.estado !== "Pendiente"}
                onChange={(e) => {
                  const nuevoProveedor = parseInt(e.target.value);
                  setOCSeleccionada((prev) =>
                    prev ? { ...prev, idProveedor: nuevoProveedor } : null
                  );
                  cargarArticulosDeProveedor(nuevoProveedor);
                }}
              >
                <option value="">Seleccionar proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.idProveedor} value={prov.idProveedor}>
                    {prov.nombreProveedor}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="text-lg font-semibold mt-4 mb-2">Artículos</h3>
            <ul className="space-y-2">
              {detalles?.map((art, idx) => (
                <li
                  key={art.idArticulo}
                  className="flex items-center justify-between bg-zinc-700 p-3 rounded-md"
                >
                  <div>
                    <p className="font-medium">{art.nombreArticulo}</p>
                    <p className="text-sm text-zinc-300">
                      ID: {art.idArticulo}
                    </p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    className="w-20 px-2 py-1 bg-zinc-800 rounded-md text-white text-center"
                    value={art.cantidadArticulos}
                    onChange={(e) => {
                      const nuevaCantidad = parseInt(e.target.value);
                      const copia = [...detalles];
                      copia[idx].cantidadArticulos = nuevaCantidad;
                      setDetalles(copia);
                    }}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-6"></div>
            <div className="flex justify-end mt-6 gap-4">
              <button
                className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600"
                onClick={cerrarModal}
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  const body = {
                    nOrdenCompra: ocSeleccionada.nOrdenCompra,
                    idProveedor: ocSeleccionada.idProveedor,
                    articulos: detalles.map((d) => ({
                      idArticulo: d.idArticulo,
                      cantidad: d.cantidadArticulos,
                    })),
                  };

                  try {
                    const res = await fetch(
                      `http://localhost:5000/OrdenCompra/modificar-orden`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      }
                    );

                    if (!res.ok) throw new Error("Error al modificar la orden");
                    alert("Orden modificada correctamente.");
                    cerrarModal();
                    cargarOrdenes();
                  } catch (error) {
                    if (error instanceof Error) {
                      alert("Error: " + error.message);
                    } else {
                      alert("Error inesperado");
                    }
                  }
                }}
              >
                Guardar cambios
              </button>

              {ocSeleccionada.estado === "Pendiente" && (
                <>
                  <button
                    className="px-4 py-2 rounded-md bg-yellow-600 hover:bg-yellow-700"
                    onClick={async () => {
                      await fetch(
                        `http://localhost:5000/OrdenCompra/confirmar-orden/${ocSeleccionada.nOrdenCompra}`,
                        { method: "POST" }
                      );
                      alert("Orden confirmada.");
                      cerrarModal();
                      cargarOrdenes();
                    }}
                  >
                    Confirmar
                  </button>

                  <button
                    className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      await fetch(
                        `http://localhost:5000/OrdenCompra/cancelar/${ocSeleccionada.nOrdenCompra}`,
                        { method: "POST" }
                      );
                      alert("Orden cancelada.");
                      cerrarModal();
                      cargarOrdenes();
                    }}
                  >
                    Cancelar OC
                  </button>
                </>
              )}

              {ocSeleccionada.estado === "Enviada" && (
                <button
                  className="px-4 py-2 rounded-md bg-purple-600 hover:bg-purple-700"
                  onClick={async () => {
                    await fetch(
                      `http://localhost:5000/OrdenCompra/orden-enproceso/${ocSeleccionada.nOrdenCompra}`,
                      { method: "POST" }
                    );
                    alert("Estado cambiado a 'En proceso'");
                    cerrarModal();
                    cargarOrdenes();
                  }}
                >
                  Marcar En Proceso
                </button>
              )}

              {ocSeleccionada.estado === "En Proceso" && (
                <button
                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    await fetch(
                      `http://localhost:5000/OrdenCompra/registrar-entrada/${ocSeleccionada.nOrdenCompra}`,
                      { method: "POST" }
                    );
                    alert("Entrada registrada");
                    cerrarModal();
                    cargarOrdenes();
                  }}
                >
                  Registrar Entrada
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal agregar orden */}
      {modalTipo === "nueva" && (
        <Modal
          open={modalAbierto}
          title="Modal agregar orden"
          onClose={cerrarModal}
        >
          <div className="relative text-white p-6 bg-zinc-800 rounded-md max-w-3xl mx-auto mt-10">
            <button
              onClick={cerrarModal}
              className="absolute top-2 right-2 text-white text-xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-bold mb-4">Crear Nueva Orden</h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">Proveedor:</label>
              <select
                className="w-full px-4 py-2 rounded-md bg-zinc-700"
                onChange={async (e) => {
                  const idProv = parseInt(e.target.value);
                  setOCSeleccionada({
                    nOrdenCompra: 0,
                    fechaOrden: "",
                    totalPagar: 0,
                    proveedor: "",
                    idProveedor: idProv,
                    loteSugerido: 0,
                    estado: "Pendiente",
                  });
                  await cargarArticulosDeProveedor(idProv);
                }}
              >
                <option value="">Seleccione un proveedor</option>
                {proveedores.map((prov) => (
                  <option key={prov.idProveedor} value={prov.idProveedor}>
                    {prov.nombreProveedor}
                  </option>
                ))}
              </select>
            </div>

            {detalles.length > 0 && (
              <>
                <h3 className="text-lg font-semibold mt-4 mb-2">Artículos</h3>
                <ul className="space-y-2">
                  {detalles.map((art, idx) => (
                    <li
                      key={art.idArticulo}
                      className="flex items-center justify-between bg-zinc-700 p-3 rounded-md"
                    >
                      <div>
                        <p className="font-medium">{art.nombreArticulo}</p>
                        <p className="text-sm text-zinc-300">
                          ID: {art.idArticulo}
                        </p>
                      </div>
                      <input
                        type="number"
                        min={1}
                        className="w-20 px-2 py-1 bg-zinc-800 rounded-md text-white text-center"
                        value={art.cantidadArticulos}
                        onChange={(e) => {
                          const nuevaCantidad = parseInt(e.target.value);
                          const copia = [...detalles];
                          copia[idx].cantidadArticulos = nuevaCantidad;
                          setDetalles(copia);
                        }}
                      />
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="flex justify-end mt-6 gap-4">
              <button
                className="px-4 py-2 rounded-md bg-gray-500 hover:bg-gray-600"
                onClick={cerrarModal}
              >
                Cancelar
              </button>

              <button
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  try {
                    const body = {
                      idProveedor: ocSeleccionada?.idProveedor,
                      articulos: detalles.map((d) => ({
                        idArticulo: d.idArticulo,
                        cantidad: d.cantidadArticulos,
                      })),
                    };

                    const res = await fetch(
                      "http://localhost:5000/OrdenCompra/generar-orden",
                      {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(body),
                      }
                    );

                    if (!res.ok) throw new Error("No se pudo crear la orden.");
                    alert("Orden creada correctamente");
                    cerrarModal();
                    cargarOrdenes();
                  } catch (err) {
                    if (err instanceof Error) {
                      alert("Error: " + err.message);
                    } else {
                      alert("Error inesperado");
                    }
                  }
                }}
              >
                Crear Orden
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
