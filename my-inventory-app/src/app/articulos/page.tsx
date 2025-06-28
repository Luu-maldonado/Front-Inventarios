"use client";

import { useEffect, useState } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaCalculator,
  FaUserTie,
} from "react-icons/fa";
import Modal from "@/app/components/Modal";

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
interface ModeloInventario {
  id: number;
  nombreModInv: string;
}

type Categoria = {
  id: number;
  nombreCatArt: string;
};

interface ProveedorArticulo {
  idProveedor: number;
  precioUnitario: number;
  tiempoEntregaDias: number;
  idArticulo: number;
  predeterminado: boolean;
  fechaFinProveedorArticulo?: string;
  costoPedido: number;
}

interface CalculoArticulo {
  idArticulo: number;
  nombreArticulo: string;
  modeloInv: string;
  stockSeguridad: number;
  puntoPedido: number;
  tiempoRevision: number;
  cgi: number;
}

interface ArticuloAReponer {
  idArticulo: number;
  nombreArticulo: string;
  stockActual: number;
  puntoPedido: number;
  stockSeguridad: number;
}

export default function Articulos() {
  const [busqueda, setBusqueda] = useState("");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const FaSearchIcon = FaSearch as unknown as React.FC<{ className?: string }>;
  const [modalEditar, setModalEditar] = useState<Articulo | null>(null);
  const [modalAgregar, setModalAgregar] = useState<boolean>(false);
  const [modelosInventario, setModelosInventario] = useState<
    ModeloInventario[]
  >([]);
  const [modalCalculoGlobal, setModalCalculoGlobal] = useState(false);
  const [calculosInventario, setCalculosInventario] = useState<
    CalculoArticulo[]
  >([]);
  const [busquedaCalculo, setBusquedaCalculo] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [modeloSeleccionado, setModeloSeleccionado] = useState("");
  const [modalProveedor, setModalProveedor] = useState<Articulo | null>(null);
  const [proveedoresArticulo, setProveedoresArticulo] = useState<
    ProveedorArticulo[]
  >([]);
  const [articulosAReponer, setArticulosAReponer] = useState<
    ArticuloAReponer[]
  >([]);
  const [modalReposicionAbierto, setModalReposicionAbierto] = useState(false);
  const [articulosFaltantes, setArticulosFaltantes] = useState<
    ArticuloAReponer[]
  >([]);
  const [modalFaltantesAbierto, setModalFaltantesAbierto] = useState(false);

  useEffect(() => {
    obtenerArticulos();
  }, []);

  useEffect(() => {
    if (modalEditar) {
      setCategoriaSeleccionada(modalEditar.categoriaArt?.toString() || "");
      setModeloSeleccionado(modalEditar.modeloInv?.toString() || "");
    }
  }, [modalEditar]);

  const filtrados = articulos.filter(
    (art) =>
      art.nombreArticulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      art.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
      String(art.idArticulo).includes(busqueda)
  );

  const handleAgregar = async (nuevo: Articulo) => {
    try {
      const res = await fetch(
        "http://localhost:5000/MaestroArticulos/articulo/CreateArticulo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(nuevo),
        }
      );

      if (!res.ok) throw new Error("Error en la creación del artículo");

      await obtenerArticulos();
      setModalAgregar(false);
    } catch (error) {
      console.error("Error al agregar el artículo:", error);
      alert("Ocurrió un error al agregar el artículo.");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resModelos, resCategorias] = await Promise.all([
          fetch(
            "http://localhost:5000/MaestroArticulos/modeloInventario/lista-modelos"
          ),
          fetch(
            "http://localhost:5000/MaestroArticulos/modeloInventario/lista-categorias"
          ),
        ]);

        const dataModelos = await resModelos.json();
        setModelosInventario(dataModelos);
        const dataCategorias = await resCategorias.json();
        setCategorias(dataCategorias);
      } catch (error) {
        console.error("Error fetching modelos o categorias:", error);
      }
    };

    fetchData();
  }, []);

  const handleEditar = async (articulo: Articulo) => {
    try {
      const response = await fetch(
        "http://localhost:5000/MaestroArticulos/articulo/UpdateArticulo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articulo),
        }
      );
      if (!response.ok) {
        throw new Error("No se pudo actualizar el artículo.");
      }

      alert("Artículo actualizado correctamente.");
      setModalEditar(null);
      await obtenerArticulos();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al actualizar el artículo.");
    }
  };

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

  const handleEliminar = async (idArticulo: number) => {
    const confirmacion = window.confirm(
      "¿Estás seguro de que querés eliminar este artículo?"
    );
    if (!confirmacion) return;

    try {
      await fetch(
        `http://localhost:5000/MaestroArticulos/articulo/DeleteArticulo/${idArticulo}`,
        {
          method: "DELETE",
        }
      );

      alert("Artículo eliminado correctamente.");
      obtenerArticulos();
    } catch (error) {
      console.error("Error eliminando el artículo:", error);
      alert("Ocurrió un error al intentar eliminar el artículo.");
    }
  };

  const abrirModalProveedor = async (articulo: Articulo) => {
    try {
      const res = await fetch(
        `http://localhost:5000/MaestroArticulos/articulosLista/proveedores/${articulo.idArticulo}`
      );
      const data = await res.json();
      setProveedoresArticulo(data); // suponiendo que es un array de ProveedorArticulo
      setModalProveedor(articulo);
    } catch (err) {
      console.error("Error al obtener proveedores:", err);
      alert("No se pudieron cargar los proveedores.");
    }
  };
  const establecerProveedorPredeterminado = async (
    idArticulo: number,
    idProveedor: number
  ) => {
    try {
      const res = await fetch(
        `http://localhost:5000/MaestroArticulos/proveedor/predeterminado?idArticulo=${idArticulo}&idProveedor=${idProveedor}`,
        {
          method: "POST",
        }
      );

      if (!res.ok)
        throw new Error("No se pudo establecer el proveedor predeterminado");

      alert("Proveedor predeterminado actualizado correctamente.");
      await obtenerArticulos();
      setModalProveedor(null);
    } catch (err) {
      console.error("Error al establecer proveedor predeterminado:", err);
      alert("Error al establecer proveedor predeterminado.");
    }
  };

  const cargarCalculos = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/MaestroArticulos/modeloInventario/calc-mod-inv"
      );
      if (!res.ok) throw new Error("Error al obtener cálculos");
      const data = await res.json();
      setCalculosInventario(data); 
      setModalCalculoGlobal(true);
      obtenerArticulos();
    } catch (error) {
      console.error("Error al cargar cálculos:", error);
      alert("No se pudieron cargar los cálculos de inventario.");
    }
  };

  const calculosFiltrados = calculosInventario.filter(
    (item) =>
      item.nombreArticulo
        ?.toLowerCase()
        .includes(busquedaCalculo.toLowerCase()) ||
      String(item.idArticulo).includes(busquedaCalculo)
  );

  const cargarArticulosAReponer = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/MaestroArticulos/articulosLista/reponer"
      );
      if (!res.ok) throw new Error("Error al obtener artículos a reponer");
      const data = await res.json();
      setArticulosAReponer(data);
      setModalReposicionAbierto(true);
    } catch (error) {
      console.error("Error al cargar artículos a reponer:", error);
      alert("No se pudieron cargar los artículos a reponer.");
    }
  };

  const cargarArticulosFaltantes = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/MaestroArticulos/articuloslista/faltantes"
      );
      if (!res.ok) throw new Error("Error al obtener artículos faltantes");
      const data = await res.json();
      setArticulosFaltantes(data);
      setModalFaltantesAbierto(true);
    } catch (error) {
      console.error("Error al cargar artículos faltantes:", error);
      alert("No se pudieron cargar los artículos faltantes.");
    }
  };

  const modeloSeleccionadoNombre = modelosInventario.find(
    (m) => m.id === Number(modeloSeleccionado)
  )?.nombreModInv;

  const esLoteFijoQ = modeloSeleccionadoNombre?.includes("LoteFijo_Q");
  const esPeriodoFijoP = modeloSeleccionadoNombre?.includes("PeriodoFijo_P");

  const modeloSeleccionadoNombreEditar = modelosInventario.find(
    (m) => m.id === Number(modeloSeleccionado)
  )?.nombreModInv;

  const esLoteFijoQEditar = modeloSeleccionadoNombreEditar?.includes("LoteFijo_Q");
  const esPeriodoFijoPEditar = modeloSeleccionadoNombreEditar?.includes("PeriodoFijo_P");
 
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
        <button
          onClick={() => setModalAgregar(true)}
          className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90"
        >
          AGREGAR ARTICULO
        </button>
        <button
          onClick={cargarCalculos}
          className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90"
        >
          <FaCalculator />
        </button>
        <button
          onClick={cargarArticulosAReponer}
          className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90"
        >
          <FaSearch className="inline-block mr-1" /> A Reponer
        </button>
        <button
          onClick={cargarArticulosFaltantes}
          className="ml-4 bg-gradient-to-r from-yellow-400 to-cyan-400 px-4 py-2 rounded text-black font-bold hover:opacity-90"
        >
          <FaSearch className="inline-block mr-1" /> Faltantes
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse text-sm">
          <thead className="bg-zinc-900 text-zinc-300">
            <tr>
              <th className="px-2 py-1 border">ID</th>
              <th className="px-2 py-1 border">Nombre</th>
              <th className="px-2 py-1 border">Descripción</th>
              <th className="px-2 py-1 border">Categoría</th>
              <th className="px-2 py-1 border">Proveedor predeterminado</th>
              <th className="px-2 py-1 border">Modelo Inventario</th>
              <th className="px-2 py-1 border">Stock Actual</th>
              <th className="px-2 py-1 border">Stock Seguridad</th>
              <th className="px-2 py-1 border">Punto Pedido</th>
              <th className="px-2 py-1 border">CGI</th>
              <th className="px-2 py-1 border">Demanda Diaria</th>
              <th className="px-2 py-1 border">Tiempo Revisión</th>
              <th className="px-2 py-1 border">Costo Almacenaje</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((art) => {
              const stock = art.stockActual ?? 0;
              const puntoPedido = parseFloat(art.puntoPedido ?? "0");
              const stockBajo = stock < puntoPedido;
              return (
                <tr
                  key={art.idArticulo}
                  className={`hover:bg-zinc-800 ${
                    stockBajo ? "bg-red-700 text-white" : ""
                  }`}
                >
                  <td className="px-2 py-1 border">{art.idArticulo}</td>
                  <td className="px-2 py-1 border">{art.nombreArticulo}</td>
                  <td className="px-2 py-1 border">{art.descripcion}</td>
                  <td className="px-2 py-1 border">{art.categoriaArt}</td>
                  <td className="px-2 py-1 border">
                    {art.proveedor?.trim() ? art.proveedor : "sin asignar"}
                  </td>
                  <td className="px-2 py-1 border">{art.modeloInv}</td>
                  <td className="px-2 py-1 border">{art.stockActual}</td>
                  <td className="px-2 py-1 border">{art.stockSeguridad}</td>
                  <td className="px-2 py-1 border">{art.puntoPedido}</td>
                  <td className="px-2 py-1 border">{art.cgi}</td>
                  <td className="px-2 py-1 border">{art.demandaDiaria}</td>
                  <td className="px-2 py-1 border">{art.tiempoRevision}</td>
                  <td className="px-2 py-1 border">${art.costoAlmacen}</td>
                  <td className="px-3 py-2 border border-gray-700 text-center">
                    <button
                      onClick={() => setModalEditar(art)}
                      className="mr-2 hover:text-yellow-300"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleEliminar(art.idArticulo!)}
                      className="hover:text-red-500"
                    >
                      <FaTrash />
                    </button>
                    <button
                      onClick={() => abrirModalProveedor(art)}
                      className="ml-2 text-yellow-300 hover:text-yellow-400"
                    >
                      <FaUserTie />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Agregar */}
      {modalAgregar && (
        <Modal title="Agregar Artículo" onClose={() => setModalAgregar(false)}>
          <div className="max-h-[80vh] overflow-y-auto p-4">
            <form
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;

                const nombreArticulo = form.nombreArticulo.value;
                const descripcion = form.descripcion.value;
                const modeloInv = parseInt(form.modeloInv.value, 10);
                const categoriaArt = parseInt(form.categoriaArticulo.value, 10);
                const demandaDiaria = parseFloat(form.demandaDiaria.value);
                const costoAlmacen = parseFloat(form.costoAlmacen.value);
                const tiempoRevision = esLoteFijoQ ? 0 : parseFloat(form.tiempoRevision.value);

                const nuevo = {
                  nombreArticulo,
                  descripcion,
                  modeloInv,
                  categoriaArt,
                  demandaDiaria,
                  tiempoRevision,
                  costoAlmacen,
                };

                if (
                  !nuevo.nombreArticulo ||
                  !nuevo.descripcion ||
                  !nuevo.modeloInv ||
                  !nuevo.categoriaArt ||
                  isNaN(nuevo.demandaDiaria) ||
                  isNaN(nuevo.tiempoRevision) ||
                  isNaN(nuevo.costoAlmacen)
                ) {
                  alert(
                    "Todos los campos son obligatorios y deben ser válidos"
                  );
                  return;
                }

                if (
                  window.confirm("¿Confirmás que querés agregar este artículo?")
                ) {
                  handleAgregar(nuevo);
                }
              }}
              className="space-y-2"
            >
              <input
                name="nombreArticulo"
                placeholder="Nombre"
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
                required
              />
              <input
                name="descripcion"
                placeholder="Descripción"
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
                required
              />
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-white block mb-1">
                    Seleccionar modelo de Inventario
                  </label>
                  <select
                    name="modeloInv"
                    className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                    onChange={(e) => {
                      setModeloSeleccionado(e.target.value);
                    }}
                  >
                    <option value="">Seleccionar modelo</option>
                    {modelosInventario.map((modelo: ModeloInventario) => (
                      <option key={modelo.id} value={modelo.id}>
                        {modelo.nombreModInv}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-white block mb-1">
                    Seleccionar categoría
                  </label>
                  <select
                    name="categoriaArticulo"
                    className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categorias.map((categoria: Categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nombreCatArt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <input
                name="demandaDiaria"
                type="number"
                placeholder="Demanda Diaria"
                min={0}
                max={1000}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
                required
              />
              <input
                name="tiempoRevision"
                type="number"
                placeholder="Tiempo Revision"
                min={0}
                max={1000}
                value={esLoteFijoQ ? 0 : undefined}
                disabled={esLoteFijoQ}
                required={esPeriodoFijoP}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              />
              <input
                name="costoAlmacen"
                type="number"
                placeholder="Costo Almacenaje"
                min={0}
                max={1000}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalAgregar(false)}
                  className="bg-zinc-600 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-white text-black px-4 py-2 rounded"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Modal Edición */}
      {modalEditar && (
        <Modal title="Editar Artículo" onClose={() => setModalEditar(null)}>
          <div className="max-h-[80vh] overflow-y-auto p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;

                const modeloInvParsed = Number(modeloSeleccionado);
                const categoriaArtParsed = Number(categoriaSeleccionada);
                const tiempoRevision = esLoteFijoQEditar ? 0 : Number(form.tiempoRevision.value);

                const articuloEditado = {
                  idArticulo: modalEditar.idArticulo,
                  nombreArticulo: form.nombreArticulo.value,
                  descripcion: form.descripcion.value,
                  modeloInv: modeloInvParsed,
                  categoriaArt: categoriaArtParsed,
                  demandaDiaria: Number(form.demandaDiaria.value),
                  tiempoRevision: tiempoRevision,
                  costoAlmacen: Number(form.costoAlmacen.value),
                };
                console.log(
                  "Artículo que se está enviando al backend:",
                  articuloEditado
                );

                if (window.confirm("¿Guardar los cambios de este artículo?")) {
                  handleEditar(articuloEditado);
                }
              }}
              className="space-y-2"
            >
              <label className="text-white block mb-1">Nombre articulo</label>
              <input
                name="nombreArticulo"
                placeholder="Nombre"
                required
                defaultValue={modalEditar.nombreArticulo}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              />
              <label className="text-white block mb-1">Descripción</label>
              <input
                name="descripcion"
                placeholder="Descripción"
                required
                defaultValue={modalEditar.descripcion}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              />
              <label className="text-white block mb-1">
                Categoria articulo
              </label>
              <p>Categoria seleccionada antes: {categoriaSeleccionada}</p>
              <select
                name="idCategoriaArticulo"
                className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                required
                defaultValue={categoriaSeleccionada}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              >
                <option value="">Seleccionar categoria</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id.toString()}>
                    {cat.nombreCatArt}
                  </option>
                ))}
              </select>
              <p>Modelo seleccionado antes: {modeloSeleccionado}</p>
              <label className="text-white block mb-1">Modelo inventario</label>
              <select
                name="modeloInv"
                required
                defaultValue={modeloSeleccionado}
                onChange={(e) => setModeloSeleccionado(e.target.value)}
                className="w-full px-2 py-1 rounded bg-gray-700 text-white"
              >
                <option value="">Seleccionar modelo</option>
                {modelosInventario.map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.nombreModInv}
                  </option>
                ))}
              </select>
              <label className="text-white block mb-1">Demanda diaria</label>
              <input
                name="demandaDiaria"
                type="number"
                placeholder="Demanda Diaria"
                required
                defaultValue={modalEditar.demandaDiaria}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              />
              <label className="text-white block mb-1">
                Tiempo de revision
              </label>
              <input
                name="tiempoRevision"
                placeholder="Tiempo de Revisión"
                value={esLoteFijoQ ? 0 : undefined}
                defaultValue={esLoteFijoQEditar ? 0 : modalEditar.tiempoRevision}
                required={esPeriodoFijoPEditar}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              />
              <label className="text-white block mb-1">
                Costo almacenamiento
              </label>
              <input
                name="costoAlmacen"
                type="number"
                placeholder="Costo de Almacenamiento"
                required
                defaultValue={modalEditar.costoAlmacen}
                className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalEditar(null)}
                  className="bg-zinc-600 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-white text-black px-4 py-2 rounded"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
      {/* Modal Proveedor */}
      {modalProveedor && (
        <Modal
          title={`Seleccionar proveedor para "${modalProveedor.nombreArticulo}"`}
          onClose={() => setModalProveedor(null)}
        >
          <div className="max-h-[80vh] overflow-y-auto p-4">
            <div className="p-4 text-sm text-white">
              {proveedoresArticulo.length === 0 && (
                <p>No hay proveedores asociados.</p>
              )}
              {proveedoresArticulo.map((prov) => (
                <div
                  key={prov.idProveedor}
                  className="flex justify-between items-center border-b border-zinc-600 py-2"
                >
                  <div>
                    <p>
                      <strong>ID:</strong> {prov.idProveedor}
                    </p>
                    <p>
                      <strong>Precio:</strong> ${prov.precioUnitario}
                    </p>
                    <p>
                      <strong>Tiempo entrega:</strong> {prov.tiempoEntregaDias}{" "}
                      días
                    </p>
                    <p>
                      <strong>Actual:</strong>{" "}
                      {prov.predeterminado ? "✅ Sí" : "No"}
                    </p>
                  </div>
                  <button
                    className="bg-blue-600 px-2 py-1 rounded mt-2"
                    onClick={() =>
                      establecerProveedorPredeterminado(
                        modalProveedor.idArticulo!,
                        prov.idProveedor
                      )
                    }
                  >
                    Establecer predeterminado
                  </button>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Cálculo */}
      {modalCalculoGlobal && (
        <Modal
          title="Cálculo de Modelos de Inventario"
          onClose={() => setModalCalculoGlobal(false)}
        >
          <div className="max-h-[80vh] overflow-y-auto p-4">
            <div className="text-sm text-white space-y-4 max-h-[70vh] overflow-y-auto">
              <input
                type="text"
                placeholder="Buscar por ID o nombre"
                value={busquedaCalculo}
                onChange={(e) => setBusquedaCalculo(e.target.value)}
                className="w-full p-2 mb-4 bg-zinc-800 border border-zinc-600 rounded text-white"
              />
              {calculosFiltrados.map((item) => (
                <div
                  key={item.idArticulo}
                  className="border-b border-zinc-600 pb-2"
                >
                  <h3 className="font-bold text-yellow-300 mb-1">
                    {item.nombreArticulo}
                  </h3>
                  <p>
                    Modelo de Inventario: <strong>{item.modeloInv}</strong>
                  </p>
                  <p>
                    Stock de Seguridad: <strong>{item.stockSeguridad}</strong>
                  </p>

                  {item.modeloInv === "LoteFijo_Q" && (
                    <>
                      <p>
                        Punto de Pedido: <strong>{item.puntoPedido}</strong>
                      </p>
                      <p>
                        Tiempo de Revisión: <em>(no aplica)</em>
                      </p>
                    </>
                  )}

                  {item.modeloInv === "PeriodoFijo_P" && (
                    <>
                      <p>
                        Tiempo de Revisión:{" "}
                        <strong>{item.tiempoRevision}</strong> días
                      </p>
                      <p>
                        Punto de Pedido: <em>(no aplica)</em>
                      </p>
                    </>
                  )}

                  <p>
                    CGI (Costo Global de Inventario):{" "}
                    <strong>${item.cgi}</strong>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
      {modalReposicionAbierto && (
        <Modal
          title="Artículos a Reponer"
          onClose={() => setModalReposicionAbierto(false)}
        >
          <div className="max-h-[80vh] overflow-y-auto p-4 text-sm text-white">
            {articulosAReponer.length === 0 ? (
              <p>No hay artículos a reponer.</p>
            ) : (
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-zinc-900 text-zinc-300">
                  <tr>
                    <th className="px-2 py-1 border">ID</th>
                    <th className="px-2 py-1 border">Nombre</th>
                    <th className="px-2 py-1 border">Stock Actual</th>
                    <th className="px-2 py-1 border">Punto Pedido</th>
                    <th className="px-2 py-1 border">Stock Seguridad</th>
                  </tr>
                </thead>
                <tbody>
                  {articulosAReponer.map((art) => (
                    <tr key={art.idArticulo} className="hover:bg-zinc-800">
                      <td className="px-2 py-1 border">{art.idArticulo}</td>
                      <td className="px-2 py-1 border">{art.nombreArticulo}</td>
                      <td className="px-2 py-1 border">{art.stockActual}</td>
                      <td className="px-2 py-1 border">{art.puntoPedido}</td>
                      <td className="px-2 py-1 border">{art.stockSeguridad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>
      )}
      {modalFaltantesAbierto && (
        <Modal
          title="Artículos Faltantes"
          onClose={() => setModalFaltantesAbierto(false)}
        >
          <div className="max-h-[80vh] overflow-y-auto p-4 text-sm text-white">
            {articulosFaltantes.length === 0 ? (
              <p>No hay artículos faltantes.</p>
            ) : (
              <table className="w-full table-auto border-collapse text-sm">
                <thead className="bg-zinc-900 text-zinc-300">
                  <tr>
                    <th className="px-2 py-1 border">ID</th>
                    <th className="px-2 py-1 border">Nombre</th>
                    <th className="px-2 py-1 border">Stock Actual</th>
                    <th className="px-2 py-1 border">Punto Pedido</th>
                    <th className="px-2 py-1 border">Stock Seguridad</th>
                  </tr>
                </thead>
                <tbody>
                  {articulosFaltantes.map((art) => (
                    <tr key={art.idArticulo} className="hover:bg-zinc-800">
                      <td className="px-2 py-1 border">{art.idArticulo}</td>
                      <td className="px-2 py-1 border">{art.nombreArticulo}</td>
                      <td className="px-2 py-1 border">{art.stockActual}</td>
                      <td className="px-2 py-1 border">{art.puntoPedido}</td>
                      <td className="px-2 py-1 border">{art.stockSeguridad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
