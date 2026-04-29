import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroProducto from "../producto/ModalRegistroProducto";
import ModalEdicionProducto from "../producto/ModalEdicionProducto";
import ModalEliminacionProducto from "../producto/ModalEliminacionProducto";
import TarjetasProductos from "../producto/TarjetasProductos";
import TablaProductos from "../producto/TablaProductos";

import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/ordenamiento/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";

const Productos = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(5);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre_producto: "",
    descripcion_producto: "",
    id_Categoria: "",
    precio_venta: "",
    archivo: null,
  });

  const [productoEditar, setProductoEditar] = useState({
    id_Producto: "",
    nombre_producto: "",
    descripcion_producto: "",
    id_Categoria: "",
    precio_venta: "",
    url_imagen: "",
    archivo: null,
  });

  const [productoEliminar, setProductoEliminar] = useState(null);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const cargarProductos = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("Productos")
        .select("*")
        .order("id_Producto", { ascending: true });

      if (error) throw error;

      setProductos(data || []);
      setProductosFiltrados(data || []);
    } catch (err) {
      console.error("Error al cargar productos:", err);

      setToast({
        mostrar: true,
        mensaje: "Error al cargar productos",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("id_Categoria", { ascending: true });

      if (error) throw error;

      setCategorias(data || []);
    } catch (err) {
      console.error("Error al cargar categorías:", err);
    }
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;

    setNuevoProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioArchivo = (e) => {
    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {
      setNuevoProducto((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      alert("Selecciona una imagen válida");
    }
  };

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;

    setProductoEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const manejoCambioArchivoEdicion = (e) => {
    const archivo = e.target.files[0];

    if (archivo && archivo.type.startsWith("image/")) {
      setProductoEditar((prev) => ({
        ...prev,
        archivo,
      }));
    } else {
      alert("Selecciona una imagen válida");
    }
  };

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  const abrirModalEdicion = (producto) => {
    setProductoEditar({
      id_Producto: producto.id_Producto,
      nombre_producto: producto.nombre_producto || "",
      descripcion_producto: producto.descripcion_producto || "",
      id_Categoria: producto.id_Categoria || "",
      precio_venta: producto.precio_venta || "",
      url_imagen: producto.url_imagen || "",
      archivo: null,
    });

    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (producto) => {
    setProductoEliminar(producto);
    setMostrarModalEliminacion(true);
  };

  const agregarProducto = async () => {
    try {
      if (
        !nuevoProducto.nombre_producto.trim() ||
        !nuevoProducto.id_Categoria ||
        !nuevoProducto.precio_venta ||
        !nuevoProducto.archivo
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa nombre, categoría, precio e imagen",
          tipo: "advertencia",
        });
        return;
      }

      const categoriaSeleccionada = Number(nuevoProducto.id_Categoria);
      const precioVenta = Number(nuevoProducto.precio_venta);

      if (Number.isNaN(categoriaSeleccionada)) {
        throw new Error("La categoría seleccionada no es válida.");
      }

      if (Number.isNaN(precioVenta)) {
        throw new Error("El precio de venta no es válido.");
      }

      const nombreArchivo = `${Date.now()}_${nuevoProducto.archivo.name}`;

      const { error: uploadError } = await supabase.storage
        .from("imagenes_productos")
        .upload(nombreArchivo, nuevoProducto.archivo);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("imagenes_productos")
        .getPublicUrl(nombreArchivo);

      const nuevoProductoInsertar = {
        id_Categoria: categoriaSeleccionada,
        nombre_producto: nuevoProducto.nombre_producto.trim(),
        precio_venta: precioVenta,
        url_imagen: urlData.publicUrl,
        descripcion_producto: nuevoProducto.descripcion_producto.trim() || null,
      };

      const { error } = await supabase
        .from("Productos")
        .insert([nuevoProductoInsertar]);

      if (error) throw error;

      setNuevoProducto({
        nombre_producto: "",
        descripcion_producto: "",
        id_Categoria: "",
        precio_venta: "",
        archivo: null,
      });

      setMostrarModal(false);

      setToast({
        mostrar: true,
        mensaje: "Producto registrado correctamente",
        tipo: "exito",
      });

      await cargarProductos();
    } catch (err) {
      console.error("Error al agregar producto:", err);

      setToast({
        mostrar: true,
        mensaje: err?.message || "Error al registrar producto",
        tipo: "error",
      });
    }
  };

  const actualizarProducto = async () => {
    try {
      if (
        !productoEditar.nombre_producto.trim() ||
        !productoEditar.id_Categoria ||
        !productoEditar.precio_venta
      ) {
        setToast({
          mostrar: true,
          mensaje: "Completa nombre, categoría y precio",
          tipo: "advertencia",
        });
        return;
      }

      let urlImagen = productoEditar.url_imagen;

      if (productoEditar.archivo) {
        const nombreArchivo = `${Date.now()}_${productoEditar.archivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from("imagenes_productos")
          .upload(nombreArchivo, productoEditar.archivo);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("imagenes_productos")
          .getPublicUrl(nombreArchivo);

        urlImagen = urlData.publicUrl;
      }

      const productoActualizar = {
        id_Categoria: Number(productoEditar.id_Categoria),
        nombre_producto: productoEditar.nombre_producto.trim(),
        precio_venta: Number(productoEditar.precio_venta),
        url_imagen: urlImagen,
        descripcion_producto: productoEditar.descripcion_producto.trim() || null,
      };

      const { error } = await supabase
        .from("Productos")
        .update(productoActualizar)
        .eq("id_Producto", productoEditar.id_Producto);

      if (error) throw error;

      setMostrarModalEdicion(false);

      setToast({
        mostrar: true,
        mensaje: "Producto actualizado correctamente",
        tipo: "exito",
      });

      await cargarProductos();
    } catch (err) {
      console.error("Error al actualizar producto:", err);

      setToast({
        mostrar: true,
        mensaje: err?.message || "Error al actualizar producto",
        tipo: "error",
      });
    }
  };

  const eliminarProducto = async () => {
    try {
      if (!productoEliminar?.id_Producto) {
        throw new Error("No se seleccionó ningún producto.");
      }

      const { error } = await supabase
        .from("Productos")
        .delete()
        .eq("id_Producto", productoEliminar.id_Producto);

      if (error) throw error;

      setMostrarModalEliminacion(false);
      setProductoEliminar(null);

      setToast({
        mostrar: true,
        mensaje: "Producto eliminado correctamente",
        tipo: "exito",
      });

      await cargarProductos();
    } catch (err) {
      console.error("Error al eliminar producto:", err);

      setToast({
        mostrar: true,
        mensaje: err?.message || "Error al eliminar producto",
        tipo: "error",
      });
    }
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setProductosFiltrados(productos);
    } else {
      const textoLower = textoBusqueda.toLowerCase().trim();

      const filtrados = productos.filter((prod) => {
        const nombre = prod.nombre_producto?.toLowerCase() || "";
        const descripcion = prod.descripcion_producto?.toLowerCase() || "";
        const precio = prod.precio_venta?.toString() || "";

        return (
          nombre.includes(textoLower) ||
          descripcion.includes(textoLower) ||
          precio.includes(textoLower)
        );
      });

      setProductosFiltrados(filtrados);
    }

    setPaginaActual(1);
  }, [textoBusqueda, productos]);

  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const indiceUltimoRegistro = paginaActual * registrosPorPagina;
  const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;

  const productosPaginados = productosFiltrados.slice(
    indicePrimerRegistro,
    indiceUltimoRegistro
  );

  return (
    <Container className="mt-5">
      <div className="product-header-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          <div>
            <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
              <i className="bi bi-bag-fill me-2"></i>Productos
            </span>

            <h2 className="mb-1">Gestión de Productos</h2>

            <p className="text-muted mb-1">
              Registra, filtra y visualiza tus productos con su imagen y categoría.
            </p>

            <small className="text-secondary">
              {productosFiltrados.length}{" "}
              {productosFiltrados.length === 1 ? "producto" : "productos"}{" "}
              disponibles
            </small>
          </div>

          <Button
            variant="primary"
            className="px-4 py-2"
            onClick={() => setMostrarModal(true)}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Nuevo Producto
          </Button>
        </div>
      </div>

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por nombre, descripción o precio..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <>
          {textoBusqueda.trim() && productosFiltrados.length === 0 && (
            <Row className="mb-4">
              <Col>
                <Alert variant="info" className="text-center">
                  No se encontraron productos que coincidan con "{textoBusqueda}".
                </Alert>
              </Col>
            </Row>
          )}

          {productosFiltrados.length > 0 ? (
            <>
              <Row>
                <Col xs={12} className="d-none d-lg-block">
                  <div className="product-table-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
                    <TablaProductos
                      productos={productosPaginados}
                      categorias={categorias}
                      abrirModalEdicion={abrirModalEdicion}
                      abrirModalEliminacion={abrirModalEliminacion}
                    />
                  </div>
                </Col>

                <Col xs={12} className="d-block d-lg-none">
                  <div className="product-table-card mb-4 p-0">
                    <TarjetasProductos
                      productos={productosPaginados}
                      categorias={categorias}
                      abrirModalEdicion={abrirModalEdicion}
                      abrirModalEliminacion={abrirModalEliminacion}
                    />
                  </div>
                </Col>
              </Row>

              <Paginacion
                registrosPorPagina={registrosPorPagina}
                totalRegistros={productosFiltrados.length}
                paginaActual={paginaActual}
                establecerPaginaActual={setPaginaActual}
                establecerRegistrosPorPagina={setRegistrosPorPagina}
              />
            </>
          ) : (
            <Row className="justify-content-center">
              <Col lg={8} className="text-center py-5">
                <div className="bg-light rounded-4 p-4">
                  <h5 className="mb-3">No hay productos registrados</h5>
                  <p className="text-muted mb-0">
                    Haz clic en "Nuevo Producto" para agregar productos.
                  </p>
                </div>
              </Col>
            </Row>
          )}
        </>
      )}

      <ModalRegistroProducto
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoProducto={nuevoProducto}
        manejoCambioInput={manejoCambioInput}
        manejoCambioArchivo={manejoCambioArchivo}
        agregarProducto={agregarProducto}
        categorias={categorias}
      />

      <ModalEdicionProducto
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        productoEditar={productoEditar}
        manejoCambioInputEdicion={manejoCambioInputEdicion}
        manejoCambioArchivoEdicion={manejoCambioArchivoEdicion}
        actualizarProducto={actualizarProducto}
        categorias={categorias}
      />

      <ModalEliminacionProducto
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarProducto={eliminarProducto}
        producto={productoEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() =>
          setToast({
            ...toast,
            mostrar: false,
          })
        }
      />
    </Container>
  );
};

export default Productos;