// src/app/proveedores/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FaUserTie, FaTrashAlt, FaEdit, FaCogs } from "react-icons/fa";
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

interface RelacionArticulo {
  idArticulo: number;
  nombreArticulo?: string;
  precioUnitario: number;
  tiempoEntregaDias: number;
  costoPedido: number;
}

interface ProveedorBackend {
  idProveedor: number;
  nombreProveedor: string;
  direccion?: string;
  mail?: string;
  telefono?: string;
  masterArticulo?: number;
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [filtro, setFiltro] = useState("");
  const [filtroArticulo, setFiltroArticulo] = useState("");
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor>(
    {
      idProveedor: 0,
      nombreProveedor: "",
      direccion: "",
      mail: "",
      telefono: "",
      articulos: [],
    }
  );
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false);
  const [modalRelacionAbierto, setModalRelacionAbierto] = useState(false);
  const [relacionesProveedor, setRelacionesProveedor] = useState<
    RelacionArticulo[]
  >([]);
  const [nuevasRelaciones, setNuevasRelaciones] = useState<
    {
      idArticulo: number;
      nombreArticulo: string;
      precioUnitario: number;
      tiempoEntregaDias: number;
      costoPedido: number;
    }[]
  >([]);
  const proveedorVacio: Proveedor = {
    idProveedor: 0,
    nombreProveedor: "",
    direccion: "",
    mail: "",
    telefono: "",
    articulos: [],
  };

  const actualizarRelacion = (
    index: number,
    campo: keyof RelacionArticulo,
    valor: number | string
  ) => {
    setNuevasRelaciones((prev) => {
      const nuevas = [...prev];
      nuevas[index] = {
        ...nuevas[index],
        [campo]: valor,
      };
      return nuevas;
    });
  };

  const loadProveedores = () => {
    fetch("http://localhost:5000/Proveedor/activo")
      .then((res) => res.json())
      .then((data) => {
        console.log("Proveedores desde el back:", data);
        const proveedoresAdaptados = data.map((prov: ProveedorBackend) => ({
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
  };

  useEffect(() => {
  loadProveedores();
  }, []);


  const proveedoresFiltrados = proveedores.filter(
    (p) =>
      p.nombreProveedor.toLowerCase().includes(filtro.toLowerCase()) ||
      p.idProveedor.toString().includes(filtro)
  );

  useEffect(() => {
    fetch("http://localhost:5000/MaestroArticulos/articulos/list-art-datos")
      .then((res) => res.json())
      .then((data) => {
        const articulosAdaptados = data.map((art: Articulo) => ({
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
            setProveedorSeleccionado({
              idProveedor: 0,
              nombreProveedor: "",
              direccion: "",
              mail: "",
              telefono: "",
              articulos: [],
            });
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
                    const confirmar = confirm(
                      "¿Estás seguro de que querés eliminar este proveedor?"
                    );
                    if (!confirmar) return;

                    try {
                      const res = await fetch(
                        `http://localhost:5000/Proveedor/eliminar/${prov.idProveedor}`,
                        {
                          method: "DELETE",
                        }
                      );

                      if (!res.ok)
                        throw new Error("Error al eliminar proveedor");

                      alert("Proveedor eliminado correctamente");
                      setProveedores((prev) =>
                        prev.filter((p) => p.idProveedor !== prov.idProveedor)
                      );
                      loadProveedores();
                    } catch (err) {
                      console.error("Error al eliminar proveedor:", err);
                      alert("Ocurrió un error al eliminar el proveedor");
                    }
                  }}
                  className="text-red-500 hover:text-red-400"
                >
                  <FaTrashAlt />
                </button>
                <button
                  onClick={async () => {
                    const proveedorConArticulos = {
                      ...prov,
                      articulos: prov.articulos || [],
                    };

                    try {
                      const res = await fetch(
                        `http://localhost:5000/Proveedor/articulos-proveedor/${prov.idProveedor}`
                      );
                      if (!res.ok)
                        throw new Error(
                          "Error al traer relaciones proveedor-artículo"
                        );

                      const data = await res.json();

                      // Enlazamos los datos con nombreArticulo a partir del listado global `articulos`
                      const relacionesConNombre = data.map(
                        (rel: RelacionArticulo) => {
                          const art = articulos.find(
                            (a) => a.idArticulo === rel.idArticulo
                          );
                          return {
                            ...rel,
                            nombreArticulo:
                              art?.nombreArticulo || "Artículo sin nombre",
                          };
                        }
                      );

                      setProveedorSeleccionado(proveedorConArticulos);
                      setRelacionesProveedor(relacionesConNombre);
                      setModalRelacionAbierto(true);
                    } catch (err) {
                      console.error(
                        "Error al cargar relaciones proveedor-artículo",
                        err
                      );
                      alert("Ocurrió un error al cargar las relaciones");
                    }
                  }}
                  className="text-yellow-400 hover:text-yellow-300"
                  title="Editar relación proveedor-artículos"
                >
                  <FaCogs />
                </button>
              </div>
            </div>
            <p className="text-zinc-400 text-sm mt-1">ID: {prov.idProveedor}</p>
            {prov.direccion && (
              <p className="text-zinc-400 text-sm">
                Dirección: {prov.direccion}
              </p>
            )}
            {prov.mail && (
              <p className="text-zinc-400 text-sm">Email: {prov.mail}</p>
            )}
            {prov.telefono && (
              <p className="text-zinc-400 text-sm">Teléfono: {prov.telefono}</p>
            )}
          </div>
        ))}
      </div>

      {modalAbierto && (
        <Modal
          title="Agregar Proveedor"
          open={modalAbierto}
          onClose={() => {
            setModalAbierto(false);
            setProveedorSeleccionado({
              idProveedor: 0,
              nombreProveedor: "",
              direccion: "",
              mail: "",
              telefono: "",
              articulos: [],
            });
            setRelacionesProveedor([]);
          }}
        >
          <div className="max-h-[80vh] overflow-y-auto p-4">
            <div className="text-white p-4">
              <h2 className="text-xl font-bold mb-4">Agregar Proveedor</h2>

              {/* Datos generales */}
              <input
                placeholder="Nombre del proveedor"
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
                value={proveedorSeleccionado!.nombreProveedor}
                onChange={(e) =>
                  setProveedorSeleccionado({
                    ...proveedorSeleccionado,
                    nombreProveedor: e.target.value,
                  })
                }
              />
              <input
                placeholder="Dirección"
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
                value={proveedorSeleccionado.direccion}
                onChange={(e) =>
                  setProveedorSeleccionado({
                    ...proveedorSeleccionado,
                    direccion: e.target.value,
                  })
                }
              />
              <input
                placeholder="Email"
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
                value={proveedorSeleccionado.mail}
                onChange={(e) =>
                  setProveedorSeleccionado({
                    ...proveedorSeleccionado,
                    mail: e.target.value,
                  })
                }
              />
              <input
                placeholder="Teléfono"
                className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
                value={proveedorSeleccionado.telefono}
                onChange={(e) =>
                  setProveedorSeleccionado({
                    ...proveedorSeleccionado,
                    telefono: e.target.value,
                  })
                }
              />

              {/* Filtro y selección de artículos */}
              <h3 className="font-semibold mt-2 mb-1">Filtrar artículos:</h3>
              <input
                placeholder="Buscar artículo"
                className="w-full px-3 py-2 mb-2 rounded-md bg-zinc-800 border border-zinc-600"
                value={filtroArticulo}
                onChange={(e) => setFiltroArticulo(e.target.value)}
              />

              <h3 className="font-semibold mt-2">Seleccioná los artículos:</h3>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {articulosFiltrados.map((art) => {
                  const index = relacionesProveedor.findIndex(
                    (r) => r.idArticulo === art.idArticulo
                  );
                  const rel = relacionesProveedor[index];
                  const seleccionado = index !== -1;

                  return (
                    <div
                      key={art.idArticulo}
                      className="border p-3 rounded bg-zinc-700"
                    >
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={seleccionado}
                          onChange={() => {
                            if (seleccionado) {
                              setRelacionesProveedor(
                                relacionesProveedor.filter(
                                  (r) => r.idArticulo !== art.idArticulo
                                )
                              );
                            } else {
                              setRelacionesProveedor([
                                ...relacionesProveedor,
                                {
                                  idArticulo: art.idArticulo,
                                  nombreArticulo: art.nombreArticulo,
                                  precioUnitario: 0,
                                  tiempoEntregaDias: 0,
                                  costoPedido: 0,
                                },
                              ]);
                            }
                          }}
                        />
                        <span className="font-semibold">
                          {art.nombreArticulo}
                        </span>
                      </label>

                      {seleccionado && rel && (
                        <>
                          <p>Precio unitario</p>
                          <input
                            type="number"
                            placeholder="Precio unitario"
                            value={rel.precioUnitario ?? 0}
                            onChange={(e) => {
                              const nuevoValor = parseFloat(e.target.value);
                              setRelacionesProveedor((prev) => {
                                const nuevas = [...prev];
                                nuevas[index] = {
                                  ...nuevas[index],
                                  precioUnitario: nuevoValor,
                                };
                                return nuevas;
                              });
                            }}
                            className="w-full mb-1 px-3 py-1 rounded bg-zinc-800"
                          />
                          <p>Tiempo entrega</p>
                          <input
                            type="number"
                            placeholder="Tiempo entrega (días)"
                            value={rel.tiempoEntregaDias}
                            onChange={(e) => {
                              const nuevas = [...relacionesProveedor];
                              nuevas[index].tiempoEntregaDias = parseInt(
                                e.target.value
                              );
                              setRelacionesProveedor(nuevas);
                            }}
                            className="w-full mb-1 px-3 py-1 rounded bg-zinc-800"
                          />
                          <p>Costo de Pedido</p>
                          <input
                            type="number"
                            placeholder="Costo de pedido"
                            value={rel.costoPedido}
                            onChange={(e) => {
                              const nuevas = [...relacionesProveedor];
                              nuevas[index].costoPedido = parseFloat(
                                e.target.value
                              );
                              setRelacionesProveedor(nuevas);
                            }}
                            className="w-full px-3 py-1 rounded bg-zinc-800"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-4 mt-4">
                <button
                  className="px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-700"
                  onClick={() => {
                    setModalAbierto(false);
                    setProveedorSeleccionado(proveedorVacio);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700"
                  onClick={async () => {
                    try {
                      // Validación básica antes de enviar
                      if (
                        !proveedorSeleccionado.nombreProveedor ||
                        !proveedorSeleccionado.direccion ||
                        !proveedorSeleccionado.mail ||
                        !proveedorSeleccionado.telefono
                      ) {
                        alert(
                          "Por favor, completá todos los campos del proveedor."
                        );
                        return;
                      }

                      // Armado del DTO combinado
                      const payload = {
                        proveedor: {
                          nombreProveedor:
                            proveedorSeleccionado.nombreProveedor,
                          direccion: proveedorSeleccionado.direccion,
                          mail: proveedorSeleccionado.mail,
                          telefono: proveedorSeleccionado.telefono,
                        },
                        articulos: relacionesProveedor
                          .filter(
                            (rel) =>
                              rel.idArticulo && rel.precioUnitario !== undefined
                          )
                          .map((rel) => {
                            const articulo = articulos.find(
                              (a) => a.idArticulo === rel.idArticulo
                            );
                            return {
                              idArticulo: rel.idArticulo,
                              nombreArticulo: articulo?.nombreArticulo || "",
                              precioUnitario: parseFloat(
                                rel.precioUnitario?.toString() || "0"
                              ),
                              tiempoEntregaDias: parseInt(
                                rel.tiempoEntregaDias?.toString() || "0"
                              ),
                              costoPedido: parseFloat(
                                rel.costoPedido?.toString() || "0"
                              ),
                            };
                          }),
                      };

                      const res = await fetch(
                        "http://localhost:5000/Proveedor/crea-prov-art",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        }
                      );

                      if (!res.ok) {
                        const error = await res.json();
                        console.error("Detalles del error:", error);
                        throw new Error("Error en la creación");
                      }

                      alert("✅ Proveedor creado correctamente");
                      setModalAbierto(false);
                      loadProveedores();
                    } catch (error) {
                      alert("❌ Error al crear el proveedor con artículos.");
                      console.error(error);
                    }
                  }}
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {modalEditarAbierto && proveedorSeleccionado && (
        <Modal
          title="Editar Proveedor"
          open={modalEditarAbierto}
          onClose={() => {
            setModalEditarAbierto(false);
            setProveedorSeleccionado(proveedorVacio);
          }}
        >
          <div className="text-white p-4">
            <h2 className="text-xl font-bold mb-4">Editar Proveedor</h2>

            <input
              placeholder="Nombre del proveedor"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.nombreProveedor}
              onChange={(e) =>
                setProveedorSeleccionado({
                  ...proveedorSeleccionado,
                  nombreProveedor: e.target.value,
                })
              }
            />
            <input
              placeholder="Dirección"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.direccion}
              onChange={(e) =>
                setProveedorSeleccionado({
                  ...proveedorSeleccionado,
                  direccion: e.target.value,
                })
              }
            />
            <input
              placeholder="Email"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.mail}
              onChange={(e) =>
                setProveedorSeleccionado({
                  ...proveedorSeleccionado,
                  mail: e.target.value,
                })
              }
            />
            <input
              placeholder="Teléfono"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 border border-zinc-700 mb-3"
              value={proveedorSeleccionado.telefono}
              onChange={(e) =>
                setProveedorSeleccionado({
                  ...proveedorSeleccionado,
                  telefono: e.target.value,
                })
              }
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-700"
                onClick={() => {
                  setModalEditarAbierto(false);
                  setProveedorSeleccionado(proveedorVacio);
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
                    const res = await fetch(
                      `http://localhost:5000/Proveedor/actualizar/${proveedorSeleccionado.idProveedor}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          nombreProveedor:
                            proveedorSeleccionado.nombreProveedor,
                          direccion: proveedorSeleccionado.direccion,
                          mail: proveedorSeleccionado.mail,
                          telefono: proveedorSeleccionado.telefono,
                        }),
                      }
                    );

                    if (!res.ok)
                      throw new Error("Error al actualizar proveedor");

                    alert("Proveedor actualizado correctamente");
                    setModalEditarAbierto(false);
                    setProveedorSeleccionado(proveedorVacio);
                    loadProveedores();
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

      {modalRelacionAbierto && proveedorSeleccionado && (
        <Modal
          title="Editar relacion proveedor-articulos"
          open={modalRelacionAbierto}
          onClose={() => {
            setModalRelacionAbierto(false);
            setProveedorSeleccionado(proveedorVacio);
            setRelacionesProveedor([]);
            setNuevasRelaciones([]);
          }}
        >
          <div className="text-white p-4 max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              Editar relación proveedor-artículos
            </h2>

            {/* ARTÍCULOS YA RELACIONADOS */}
            <h3 className="font-semibold mb-2">Artículos relacionados:</h3>
            {relacionesProveedor.length === 0 && (
              <p className="text-sm text-gray-400">
                No hay artículos relacionados.
              </p>
            )}
            {relacionesProveedor.map((rel, index) => (
              <div
                key={`${ rel.idArticulo}-${index}`}
                className="flex justify-between items-center mb-2 bg-zinc-800 p-2 rounded"
              >
                <span>{rel.nombreArticulo}</span>
                <button
                  className="text-red-500 hover:text-red-300"
                  onClick={async () => {
                    try {
                      await fetch(
                        `http://localhost:5000/api/ProveedorArticulo/baja-prov-art`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            idProveedor: proveedorSeleccionado.idProveedor,
                            idArticulo: rel.idArticulo,
                          }),
                        }
                      );
                      setRelacionesProveedor(
                        relacionesProveedor.filter(
                          (r) => r.idArticulo !== rel.idArticulo
                        )
                      );
                    } catch (err) {
                      console.error(err);
                      alert("Error al crear nuevas relaciones");
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            ))}

            {/* NUEVAS RELACIONES */}
            <h3 className="font-semibold mt-4 mb-2">
              Agregar nuevas relaciones:
            </h3>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {articulos
                .filter(
                  (a) =>
                    !relacionesProveedor.some(
                      (r) => r.idArticulo === a.idArticulo
                    )
                )
                .map((art, mapIndex) => {
                  const relIndex = nuevasRelaciones.findIndex(
                    (r) => r.idArticulo === art.idArticulo
                  );
                  const rel = nuevasRelaciones[relIndex];

                  return (
                    <div
                      key={`new-${art.idArticulo}-${mapIndex}`}
                      className="border p-3 rounded bg-zinc-700"
                    >
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={!!rel}
                          onChange={() => {
                            const nuevas = [...nuevasRelaciones];
                            if (rel) {
                              setNuevasRelaciones(
                                nuevas.filter(
                                  (r) => r.idArticulo !== art.idArticulo
                                )
                              );
                            } else {
                              nuevas.push({
                                idArticulo: art.idArticulo,
                                nombreArticulo: art.nombreArticulo,
                                precioUnitario: 0,
                                tiempoEntregaDias: 0,
                                costoPedido: 0,
                              });
                              setNuevasRelaciones(nuevas);
                            }
                          }}
                        />
                        <span>{art.nombreArticulo}</span>
                      </label>

                      {!!rel && (
                        <>
                          <p>Precio unitario</p>
                          <input
                            type="number"
                            placeholder="Precio unitario"
                            value={rel.precioUnitario ?? ""}
                            onChange={(e) =>
                              actualizarRelacion(
                                mapIndex,
                                "precioUnitario",
                                parseFloat(e.target.value)
                              )
                            }
                            className="w-full mb-1 px-3 py-1 rounded bg-zinc-800"
                          />
                          <p>Tiempo Entrega</p>
                          <input
                            type="number"
                            placeholder="Tiempo entrega (días)"
                            value={rel.tiempoEntregaDias ?? ""}
                            onChange={(e) => {
                              const nuevas = [...nuevasRelaciones];
                              nuevas[mapIndex].tiempoEntregaDias = parseInt(
                                e.target.value
                              );
                              setNuevasRelaciones(nuevas);
                            }}
                            className="w-full mb-1 px-3 py-1 rounded bg-zinc-800"
                          />
                          <p>Costo Pedido</p>
                          <input
                            type="number"
                            placeholder="Costo de pedido"
                            value={rel.costoPedido ?? ""}
                            onChange={(e) => {
                              const nuevas = [...nuevasRelaciones];
                              nuevas[mapIndex].costoPedido = parseFloat(
                                e.target.value
                              );
                              setNuevasRelaciones(nuevas);
                            }}
                            className="w-full px-3 py-1 rounded bg-zinc-800"
                          />
                        </>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-end gap-4 mt-4">
              <button
                className="px-4 py-2 rounded-md bg-zinc-600 hover:bg-zinc-700"
                onClick={() => {
                  setModalRelacionAbierto(false);
                  setProveedorSeleccionado(proveedorVacio);
                  setNuevasRelaciones([]);
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600"
                onClick={async () => {
                  try {
                    for (const rel of nuevasRelaciones) {
                      await fetch(
                        "http://localhost:5000/api/ProveedorArticulo",
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            idProveedor: proveedorSeleccionado.idProveedor,
                            idArticulo: rel.idArticulo,
                            nombreArticulo: rel.nombreArticulo,
                            precioUnitario: rel.precioUnitario,
                            tiempoEntregaDias: rel.tiempoEntregaDias,
                            costoPedido: rel.costoPedido,
                            predeterminado: false,
                            fechaFinProveedorArticulo: null,
                          }),
                        }
                      );
                    }

                    alert("Relaciones creadas correctamente");
                    setModalRelacionAbierto(false);
                    setProveedorSeleccionado(proveedorVacio);
                    setNuevasRelaciones([]);
                    loadProveedores();
                  } catch (err) {
                    console.error("Error al crear nuevas relaciones:", err);
                    alert("Error al crear nuevas relaciones");
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
