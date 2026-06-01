import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/ordenamiento/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion";
import TablaVentas from "../components/ventas/TablaVentas";
import TarjetaVenta from "../components/ventas/TarjetaVenta";
import FormularioVenta from "../components/ventas/FormularioVenta";
import ModalEliminacionVenta from "../components/ventas/ModalEliminacionVenta";

const Ventas = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [ventas, setVentas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ventaAEditar, setVentaAEditar] = useState(null);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [ventaAEliminar, setVentaAEliminar] = useState(null);

  const [clientes, setClientes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [productos, setProductos] = useState([]);

  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [detalles, setDetalles] = useState([]);
  const [totalGeneral, setTotalGeneral] = useState(0);

  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [registrosPorPagina, establecerRegistrosPorPagina] = useState(8);
  const [paginaActual, establecerPaginaActual] = useState(1);

  const ventasPaginadas = ventasFiltradas.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const cargarDatosAuxiliares = async () => {
    try {
      const [c, e, p] = await Promise.all([
        supabase.from("clientes").select("*"),
        supabase.from("empleados").select("*"),
        supabase.from("Productos").select("*")
      ]);
      console.log("[DEBUG] cargarDatosAuxiliares -> clientesResp:", c);
      console.log("[DEBUG] cargarDatosAuxiliares -> empleadosResp:", e);
      console.log("[DEBUG] cargarDatosAuxiliares -> productosResp:", p);
      if (c.data) setClientes(c.data);
      if (e.data) setEmpleados(e.data);
      if (p.data) setProductos(p.data);
      return { productos: p.data || [] };
    } catch (err) {
      console.error("Error cargando auxiliares:", err);
      return { productos: [] };
    }
  };

  const cargarVentas = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("ventas")
        .select(`
          *,
          clientes (nombre_cliente, apellido_cliente),
          empleados (nombre_empleado, apellido_empleado)
        `)
        .order("fecha_venta", { ascending: false });

      if (error) {
        console.error("Error al cargar ventas:", error, error?.message, error?.details, error?.hint);
        setToast({ mostrar: true, mensaje: "Error al cargar ventas", tipo: "error" });
        return;
      }

      setVentas(data || []);
    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: "Error inesperado al cargar ventas", tipo: "error" });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await cargarDatosAuxiliares();
      await cargarVentas();
    };

    init();
  }, []);

  useEffect(() => {
    if (ventaAEditar) {
      const cliente = clientes.find(c => c.id_cliente === ventaAEditar.id_cliente);
      const empleado = empleados.find(e => e.id_empleado === ventaAEditar.id_empleado);

      setClienteSeleccionado(cliente || null);
      setEmpleadoSeleccionado(empleado || null);
      setMetodoPago(ventaAEditar.metodo_pago || "efectivo");

      if (ventaAEditar.detalles_ventas?.length > 0) {
        const detallesFormateados = ventaAEditar.detalles_ventas.map(d => ({
          id_producto: d.id_producto,
          nombre_producto: d.productos?.nombre_producto || "Producto",
          precio: parseFloat(d.precio_unitario),
          cantidad: d.cantidad
        }));
        setDetalles(detallesFormateados);
      } else {
        setDetalles([]);
      }
    }
  }, [ventaAEditar, clientes, empleados]);

  useEffect(() => {
    const total = detalles.reduce((sum, det) => sum + (det.cantidad * det.precio), 0);
    setTotalGeneral(total);
  }, [detalles]);

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setVentasFiltradas(ventas);
    } else {
      const textoLower = textoBusqueda.toLowerCase();
      const filtradas = ventas.filter(v =>
        `${v.clientes?.nombre_cliente || ''} ${v.clientes?.apellido_cliente || ''}`.toLowerCase().includes(textoLower) ||
        v.empleados?.nombre_empleado?.toLowerCase().includes(textoLower)
      );
      setVentasFiltradas(filtradas);
    }
  }, [textoBusqueda, ventas]);

  const abrirNuevaVenta = () => {
    resetFormulario();
    setMostrarFormulario(true);
  };

  const abrirEdicion = (venta) => {
    setVentaAEditar(venta);
    setMostrarFormulario(true);
  };

  const abrirModalEliminacion = (venta) => {
    setVentaAEliminar(venta);
    setMostrarModalEliminacion(true);
  };

  const eliminarVenta = async () => {
    if (!ventaAEliminar) return;

    try {
      setMostrarModalEliminacion(false);

      const { error: errorDetalles } = await supabase
        .from("detalles_ventas")
        .delete()
        .eq("id_venta", ventaAEliminar.id_venta);

      if (errorDetalles) {
        console.error("Error al eliminar detalles de venta:", errorDetalles);
        setToast({ mostrar: true, mensaje: "Error al eliminar detalles de la venta", tipo: "error" });
        return;
      }

      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id_venta", ventaAEliminar.id_venta);

      if (error) {
        console.error("Error al eliminar venta:", error);
        setToast({ mostrar: true, mensaje: "Error al eliminar la venta", tipo: "error" });
        return;
      }

      await cargarVentas();
      setToast({ mostrar: true, mensaje: "Venta eliminada exitosamente", tipo: "exito" });
    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: "Error inesperado al eliminar la venta", tipo: "error" });
    }
  };

  const resetFormulario = () => {
    setClienteSeleccionado(null);
    setEmpleadoSeleccionado(null);
    setMetodoPago("efectivo");
    setDetalles([]);
    setVentaAEditar(null);
  };

  const agregarDetalle = (producto, cantidad) => {
    if (!producto || !cantidad) return;
    const productoId = producto.id_producto ?? producto.id_Producto;
    setDetalles(prev => {
      const existe = prev.find(d => d.id_producto === productoId);
      if (existe) {
        return prev.map(d =>
          d.id_producto === productoId ? { ...d, cantidad: d.cantidad + cantidad } : d
        );
      }
      return [...prev, {
        id_producto: productoId,
        nombre_producto: producto.nombre_producto,
        precio: producto.precio_venta,
        cantidad
      }];
    });
  };

  const eliminarDetalle = (id_producto) => {
    setDetalles(prev => prev.filter(d => d.id_producto !== id_producto));
  };

  const actualizarCantidad = (id_producto, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setDetalles(prev => prev.map(d =>
      d.id_producto === id_producto ? { ...d, cantidad: nuevaCantidad } : d
    ));
  };

  const guardarVenta = async () => {
    if (!clienteSeleccionado || !empleadoSeleccionado || detalles.length === 0) {
      setToast({ mostrar: true, mensaje: "Faltan datos obligatorios", tipo: "advertencia" });
      return;
    }

    try {
      if (ventaAEditar) {
        const { error: errorVenta } = await supabase
          .from("ventas")
          .update({
            id_cliente: clienteSeleccionado.id_cliente,
            id_empleado: empleadoSeleccionado.id_empleado,
            metodo_pago: metodoPago,
            total: totalGeneral
          })
          .eq("id_venta", ventaAEditar.id_venta);

        if (errorVenta) throw errorVenta;

        const { error: errorDelete } = await supabase
          .from("detalles_ventas")
          .delete()
          .eq("id_venta", ventaAEditar.id_venta);

        if (errorDelete) throw errorDelete;

        const detallesInsert = detalles.map(d => ({
          id_venta: ventaAEditar.id_venta,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio,
          subtotal: d.cantidad * d.precio
        }));

        const { error: errorInsert } = await supabase
          .from("detalles_ventas")
          .insert(detallesInsert);

        if (errorInsert) throw errorInsert;

        setToast({ mostrar: true, mensaje: "Venta actualizada exitosamente", tipo: "exito" });
      } else {
        const nicaNow = () => new Date().toLocaleString("sv", { timeZone: "America/Managua" }).replace(" ", "T");

        const { data: ventaData, error: errorVenta } = await supabase
          .from("ventas")
          .insert([{
            id_cliente: clienteSeleccionado.id_cliente,
            id_empleado: empleadoSeleccionado.id_empleado,
            fecha_venta: nicaNow(),
            metodo_pago: metodoPago,
            total: totalGeneral
          }])
          .select()
          .single();

        if (errorVenta) throw errorVenta;

        const detallesInsert = detalles.map(d => ({
          id_venta: ventaData.id_venta,
          id_producto: d.id_producto,
          cantidad: d.cantidad,
          precio_unitario: d.precio,
          subtotal: d.cantidad * d.precio
        }));

        const { error: errorInsert } = await supabase
          .from("detalles_ventas")
          .insert(detallesInsert);

        if (errorInsert) throw errorInsert;

        setToast({ mostrar: true, mensaje: "Venta registrada exitosamente", tipo: "exito" });
      }

      resetFormulario();
      setMostrarFormulario(false);
      await cargarVentas();

    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: "Error al guardar la venta", tipo: "error" });
    }
  };

  const manejarBusqueda = (e) => setTextoBusqueda(e.target.value);

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-2">
        <Col xs={12} lg={6}>
          <h3 className="mb-0">
            <i className="bi bi-receipt-cutoff me-2"></i> Ventas
          </h3>
        </Col>
      </Row>
      <hr />

      <Row className="mb-4 align-items-center">
        <Col xs={12} md={7} lg={6} className="mb-3 mb-md-0">
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
            placeholder="Buscar por cliente o empleado..."
          />
        </Col>
        <Col xs={12} md={5} lg={6} className="text-md-end">
          <Button variant="success" onClick={abrirNuevaVenta} size="md">
            <i className="bi bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Venta</span>
          </Button>
        </Col>
      </Row>

      {cargando ? (
        <Row className="text-center my-5">
          <Col>
            <Spinner animation="border" variant="success" size="lg" />
            <p className="mt-3 text-muted">Cargando ventas...</p>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col xs={12} className="d-lg-none">
            <TarjetaVenta
              ventas={ventasPaginadas}
              abrirEdicion={abrirEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
          <Col lg={12} className="d-none d-lg-block">
            <TablaVentas
              ventas={ventasPaginadas}
              abrirEdicion={abrirEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>
        </Row>
      )}

      {!cargando && ventasFiltradas.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Alert variant="info" className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
              <div>
                <i className="bi bi-info-circle me-2"></i>
                {ventas.length === 0
                  ? "No hay ventas registradas aún."
                  : `No se encontraron ventas para "${textoBusqueda}".`}
              </div>
              {ventas.length === 0 && (
                <Button variant="success" onClick={abrirNuevaVenta}>
                  <i className="bi bi-plus-lg me-2"></i>
                  Agregar venta
                </Button>
              )}
            </Alert>
          </Col>
        </Row>
      )}
      {ventasFiltradas.length > 0 && (
        <Paginacion
          registrosPorPagina={registrosPorPagina}
          totalRegistros={ventasFiltradas.length}
          paginaActual={paginaActual}
          establecerPaginaActual={establecerPaginaActual}
          establecerRegistrosPorPagina={establecerRegistrosPorPagina}
        />
      )}

      <FormularioVenta
        mostrar={mostrarFormulario}
        setMostrar={setMostrarFormulario}
        clientes={clientes}
        empleados={empleados}
        productos={productos}
        clienteSeleccionado={clienteSeleccionado}
        setClienteSeleccionado={setClienteSeleccionado}
        empleadoSeleccionado={empleadoSeleccionado}
        setEmpleadoSeleccionado={setEmpleadoSeleccionado}
        metodoPago={metodoPago}
        setMetodoPago={setMetodoPago}
        detalles={detalles}
        totalGeneral={totalGeneral}
        agregarDetalle={agregarDetalle}
        eliminarDetalle={eliminarDetalle}
        actualizarCantidad={actualizarCantidad}
        guardarVenta={guardarVenta}
        ventaAEditar={ventaAEditar}
      />

      <ModalEliminacionVenta
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        eliminarVenta={eliminarVenta}
        venta={ventaAEliminar}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Ventas;