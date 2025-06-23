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
  idArticulo?: number; // puede que aún no exista en creación
  nombreArticulo: string;
  descripcionArticulo: string;
  proveedor: string;
  modeloInv: number;
  categoriaArt: number;
  demandaDiaria: number;
  tiempoRevision: number;
  stockActual: number;
  stockSeguridad: number;
  puntoPedido: string;
  cgi: string;
  costoAlmacenaje: number;
  costoPedido?: number;
  costoCompra?: number;
  stock?: {
    stockActual: number;
    stockSeguridad: number;
  };
  proveedorPredeterminado?: ProveedorArticulo
  estado?: string;
  fechaBaja?: string;
  masterArticulo?: {
    nombreMaestro: string;
    idMaestroArticulo: number;
  };
}
interface ModeloInventario {
  idModeloInventario: number;
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
  fechaFinProveedorArticulo?: string; // opcional si puede venir null
  costoPedido: number;
}



export default function Articulos() {
  const [busqueda, setBusqueda] = useState("");
  const [articulos, setArticulos] = useState<Articulo[]>([])
  const FaSearchIcon = FaSearch as unknown as React.FC<{ className?: string }>
  const [modalEditar, setModalEditar] = useState<Articulo | null>(null);
  const [modalAgregar, setModalAgregar] = useState<boolean>(false);
  const [modelosInventario, setModelosInventario] = useState<ModeloInventario[]>([]);
  const [proveedores] = useState<{ idProveedor: number, nombreProveedor: string }[]>([]);
  const [modalStock, setModalStock] = useState<boolean>(false);
  const [modalCalculoGlobal, setModalCalculoGlobal] = useState(false);
  const [calculosInventario, setCalculosInventario] = useState<
    { idArticulo: number; nombreArticulo: string; loteFijo: number; intervaloFijo: number }[]
  >([]);
  const [busquedaCalculo, setBusquedaCalculo] = useState("");
  const [busquedaStock, setBusquedaStock] = useState("");
  const [categorias, setCategorias] = useState<Categoria[]>([]);


  useEffect(() => {
    fetch("http://localhost:5000/MaestroArticulos/articulos/list-art-datos")
      .then((res) => res.json())
      .then((data) => {
        const articulosTransformados: Articulo[] = data.map((item: Articulo) => ({
          idArticulo: item.idArticulo,
          nombreArticulo: item.nombreArticulo,
          descripcionArticulo: item.descripcionArticulo || item.descripcionArticulo || "",
          categoriaArticulo: item.categoriaArt,
          proveedor: item.proveedor || "Predeterminado",
          modeloInventario: item.modeloInv,
          demandaDiaria: item.demandaDiaria,
          tiempoRevision: item.tiempoRevision || "",
          stockActual: Number(item.stockActual) || 0,
          stockSeguridad: Number(item.stockSeguridad) || 0,
          puntoPedido: item.puntoPedido || "",
          cgi: item.cgi || "",
          costoAlmacenaje: Number(item.costoAlmacenaje) || 0,
        }));
        setArticulos(articulosTransformados);
      })
      .catch((error) => console.error("Error al cargar artículos:", error));
  }, []);


  const filtrados = articulos.filter((art) =>
    art.nombreArticulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    art.descripcionArticulo.toLowerCase().includes(busqueda.toLowerCase()) ||
    String(art.idArticulo).includes(busqueda)
  );


  const handleAgregar = async (nuevo: Articulo) => {
    try {
      const res = await fetch("http://localhost:5000/MaestroArticulos/articulo/CreateArticulo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(nuevo),
      });

      if (!res.ok) throw new Error("Error en la creación del artículo");

      const data = await res.json();
      setArticulos((prev) => [...prev, data]);
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
          fetch("http://localhost:5000/MaestroArticulos/modeloInventario/lista-modelos"),
          fetch("http://localhost:5000/MaestroArticulos/modeloInventario/lista-categorias"),
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
      const response = await fetch("http://localhost:5000/MaestroArticulos/articulo/UpdateArticulo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articulo),
      });

      if (!response.ok) {
        throw new Error("No se pudo actualizar el artículo.");
      }

      alert("Artículo actualizado correctamente.");
      setModalEditar(null);
      // Si tenés una función para recargar la lista de artículos, llamala acá
      // await fetchArticulos();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al actualizar el artículo.");
    }
  };

  const obtenerArticulos = async () => {
    try {
      const res = await fetch("http://localhost:5000/MaestroArticulos/articulos/list-art-datos");
      const data = await res.json();
      const articulosTransformados: Articulo[] = data.map((item: Articulo) => ({
        idArticulo: item.idArticulo,
        nombreArticulo: item.nombreArticulo,
        descripcionArticulo: item.descripcionArticulo || "",
        categoriaArt: item.categoriaArt,
        proveedor: item.proveedor || "Predeterminado",
        modeloInv: item.modeloInv,
        demandaDiaria: item.demandaDiaria,
        tiempoRevision: item.tiempoRevision || "",
        stockActual: Number(item.stockActual) || 0,
        stockSeguridad: Number(item.stockSeguridad) || 0,
        puntoPedido: item.puntoPedido || "",
        cgi: item.cgi || "",
        costoAlmacenaje: Number(item.costoAlmacenaje) || 0,
      }));
      setArticulos(articulosTransformados);
    } catch (error) {
      console.error("Error al cargar artículos:", error);
    }
  };

  const handleEliminar = async (idArticulo: number) => {
    const confirmacion = window.confirm("¿Estás seguro de que querés eliminar este artículo?");
    if (!confirmacion) return;

    try {
      await fetch(`http://localhost:5000/MaestroArticulos/articulo/DeleteArticulo/${idArticulo}`, {
        method: "DELETE",
      });


      alert("Artículo eliminado correctamente.");
      // Actualizar lista
      obtenerArticulos(); // Asegurate de tener esta función para volver a cargar los artículos
    } catch (error) {
      console.error("Error eliminando el artículo:", error);
      alert("Ocurrió un error al intentar eliminar el artículo.");
    }
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
              <th className="px-2 py-1 border">ID</th>
              <th className="px-2 py-1 border">Nombre</th>
              <th className="px-2 py-1 border">Descripción</th>
              <th className="px-2 py-1 border">Categoría</th>
              <th className="px-2 py-1 border">Proveedor</th>
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
            {filtrados.map((art) => (
              <tr key={art.idArticulo} className="hover:bg-zinc-800">
                <td className="px-2 py-1 border">{art.idArticulo}</td>
                <td className="px-2 py-1 border">{art.nombreArticulo}</td>
                <td className="px-2 py-1 border">{art.descripcionArticulo}</td>
                <td className="px-2 py-1 border">{art.categoriaArt}</td>
                <td className="px-2 py-1 border">{art.proveedor}</td>
                <td className="px-2 py-1 border">
                  {typeof art.modeloInv === "object" && art.modeloInv !== null
                    ? art.modeloInv
                    : "Sin modelo"}
                </td>
                <td className="px-2 py-1 border">{art.stockActual}</td>
                <td className="px-2 py-1 border">{art.stockSeguridad}</td>
                <td className="px-2 py-1 border">{art.puntoPedido}</td>
                <td className="px-2 py-1 border">{art.cgi}</td>
                <td className="px-2 py-1 border">{art.demandaDiaria}</td>
                <td className="px-2 py-1 border">{art.tiempoRevision}</td>
                <td className="px-2 py-1 border">${art.costoAlmacenaje}</td>
                <td className="px-3 py-2 border border-gray-700 text-center">
                  <button onClick={() => setModalEditar(art)} className="mr-2 hover:text-yellow-300">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleEliminar(art.idArticulo!)} className="hover:text-red-500">
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
          <form onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            const form = e.currentTarget as any;

            const idModeloInventario = Number(form.idModeloInventario.value);
            const idCategoria = Number(form.categoriaArticulo.value);

            if (!idModeloInventario || !idCategoria) {
  alert("Seleccioná modelo de inventario y categoría.");
  return;
}

            const modeloSeleccionado = modelosInventario.find((m) => m.idModeloInventario === idModeloInventario);
            const categoriaSeleccionada = categorias.find((c) => c.id === idCategoria);

            console.log("Modelo ID:", form.idModeloInventario?.value);
            console.log("Categoría ID:", form.categoriaArticulo?.value);
            console.log("Nombre:", form.nombreArticulo?.value);
            console.log("Descripción:", form.descripcionArticulo?.value);
            console.log("Demanda:", form.demandaDiaria?.value);
            console.log("Revisión:", form.tiempoRevision?.value);
            console.log("Almacenaje:", form.costoAlmacenaje?.value);

            if (
              !modeloSeleccionado ||
              !categoriaSeleccionada ||
              !form.nombreArticulo.value ||
              !form.descripcionArticulo.value ||
              !form.demandaDiaria.value ||
              !form.tiempoRevision.value ||
              !form.costoAlmacenaje.value
            ) {
              alert("Todos los campos son obligatorios");
              return;
            }

            const nuevo: Articulo = {
              nombreArticulo: form.nombreArticulo.value,
              descripcionArticulo: form.descripcionArticulo.value,
              modeloInv: Number(idModeloInventario),
              categoriaArt: Number(idCategoria),
              demandaDiaria: Number(form.demandaDiaria.value),
              tiempoRevision: Number(form.tiempoRevision.value),
              costoAlmacenaje: Number(form.costoAlmacenaje.value),
              stockActual: 0,
              stockSeguridad: 0,
              puntoPedido: "",
              cgi: "",
              proveedor: "Predeterminado",
            };

            if (window.confirm("¿Confirmás que querés agregar este artículo?")) {
              handleAgregar(nuevo);
            }
          }}
            className="space-y-2"
          >

            <input name="nombreArticulo" placeholder="Nombre" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="descripcionArticulo" placeholder="Descripción" className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="demandaDiaria" type="number" placeholder="Demanda Diaria" min={0} max={10000} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="tiempoRevision" type="number" placeholder="Tiempo Revision" min={0} max={10000} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <input name="costoAlmacenaje" type="number" placeholder="Costo Almacenaje" min={0} max={10000} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" required />
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-white block mb-1">Seleccionar modelo de Inventario</label>
                <select
                  name="idModeloInventario"
                  className="w-full px-2 py-1 rounded bg-gray-700 text-white">
                  <option value="">Seleccionar modelo</option>
                  {modelosInventario.map((modelo: ModeloInventario) => (
                    <option key={modelo.idModeloInventario} value={modelo.idModeloInventario}>
                      {modelo.nombreModInv}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-white block mb-1">Seleccionar categoría</label>
                <select
                  name="categoriaArticulo"
                  className="w-full px-2 py-1 rounded bg-gray-700 text-white">
                  <option value="">Seleccionar categoría</option>
                  {categorias.map((categoria: Categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombreCatArt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
      )
      }

      {/* Modal Edición */}
      {
        modalEditar && (
          <Modal title="Editar Artículo" onClose={() => setModalEditar(null)}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;

                // Obtener proveedor
                const idProveedor = Number(form.idProveedor.value);
                const proveedorSeleccionado = proveedores.find((p) => p.idProveedor === idProveedor);

                // Obtener modelo de inventario
                const idModeloInventario = Number(form.idModeloInventario.value);
                const modeloSeleccionado = modelosInventario.find((m) => m.idModeloInventario === idModeloInventario);

                // Obtener categoría
                const idCategoriaArticulo = Number(form.idCategoriaArticulo.value);
                const categoriaSeleccionada = categorias.find((c) => c.id === idCategoriaArticulo);


                const articuloEditado: Articulo = {
                  nombreArticulo: form.nombreArticulo.value,
                  descripcionArticulo: form.descripcionArticulo.value,
                  demandaDiaria: Number(form.demandaDiaria.value),
                  tiempoRevision: Number(form.tiempoRevision.value),
                  costoAlmacenaje: Number(form.costoAlmacenaje.value),
                  puntoPedido: form.puntoPedido.value,
                  modeloInventario: modeloSeleccionado
                    ? {
                      idModeloInventario: modeloSeleccionado.idModeloInventario,
                      nombreModInv: modeloSeleccionado.nombreModInv,
                    }
                    : null,
                  categoriaArticulo: categoriaSeleccionada
                    ? {
                      id: categoriaSeleccionada.id,
                      nombreCatArt: categoriaSeleccionada.nombreCatArt,
                    }
                    : "", // vacío si no hay selección
                  proveedorPredeterminado: proveedorSeleccionado
                    ? {
                      idProveedor: proveedorSeleccionado.idProveedor,
                      nombreProveedor: proveedorSeleccionado.nombreProveedor,
                      tipoProveedor: proveedorSeleccionado.tipoProveedor ?? "General",
                    }
                    : undefined,
                  estado: modalEditar.estado,
                  fechaBaja: modalEditar.fechaBaja,
                };

                if (window.confirm("¿Guardar los cambios de este artículo?")) {
                  handleEditar(articuloEditado);
                }
              }}
              className="space-y-2"
            >
              <input name="nombreArticulo" placeholder="Nombre" required defaultValue={modalEditar.nombreArticulo} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" />
              <input name="descripcionArticulo" placeholder="Descripción" required defaultValue={modalEditar.descripcionArticulo} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" />
              <select
                name="idCategoriaArticulo"
                className="w-full px-2 py-1 rounded bg-gray-700 text-white"
                required
                defaultValue={
                  typeof modalEditar.categoriaArticulo === "object"
                    ? modalEditar.categoriaArticulo.id
                    : ""
                }
              >
                <option value="">Seleccionar Categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nombreCatArt}
                  </option>
                ))}
              </select>
              <select
                name="idModeloInventario"
                required
                defaultValue={
                  typeof modalEditar.modeloInventario === "object"
                    ? modalEditar.modeloInventario.idModeloInventario
                    : ""
                }
                className="w-full px-2 py-1 rounded bg-gray-700 text-white"
              >
                <option value="">Seleccionar Modelo de Inventario</option>
                {modelosInventario.map((m) => (
                  <option key={m.idModeloInventario} value={m.idModeloInventario}>
                    {m.nombreModInv}
                  </option>
                ))}
              </select>
              <select
                name="idProveedor"
                required
                defaultValue={modalEditar.proveedorPredeterminado?.idProveedor ?? ""}
                className="w-full px-2 py-1 rounded bg-gray-700 text-white"
              >
                <option value="">Seleccionar Proveedor</option>
                {proveedores.map((p) => (
                  <option key={p.idProveedor} value={p.idProveedor}>
                    {p.nombreProveedor}
                  </option>
                ))}
              </select>
              <input name="demandaDiaria" type="number" placeholder="Demanda Diaria" required defaultValue={modalEditar.demandaDiaria} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" />
              <input name="tiempoRevision" placeholder="Tiempo de Revisión" required defaultValue={modalEditar.tiempoRevision} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" />
              <input name="costoAlmacenaje" type="number" placeholder="Costo de Almacenamiento" required defaultValue={modalEditar.costoAlmacenaje} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" />
              <input name="puntoPedido" type="number" placeholder="Pundo de Pedido" required defaultValue={modalEditar.puntoPedido} className="w-full p-2 bg-zinc-800 border border-zinc-600 rounded" />
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
        )
      }

      {/* Modal Cálculo */}
      {
        modalCalculoGlobal && (
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
        )
      }

      {/* Modal Stock */}
      {
        modalStock && (
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
        )
      }
    </div >
  );
}
