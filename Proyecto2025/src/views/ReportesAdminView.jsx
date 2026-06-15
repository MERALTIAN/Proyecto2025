import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Form,
  Button,
  Badge,
  Alert,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { supabase } from "../database/supabaseconfig";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Download,
  Package,
  PieChart as PieIcon,
  Gift,
  CreditCard,
  BarChart3,
  FileText,
  Printer,
} from "lucide-react";

const COLORES = ["#dc3545", "#ffc107", "#28a745", "#17a2b8", "#6f42c1", "#fd7e14", "#20c997", "#e83e8c"];
const COLORES_PIE = ["#28a745", "#dc3545", "#17a2b8", "#ffc107", "#6f42c1", "#20c997"];

const ReportesAdminView = () => {
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [fechaDesde, setFechaDesde] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split("T")[0];
  });
  const [fechaHasta, setFechaHasta] = useState(new Date().toISOString().split("T")[0]);

  const graficoLineasRef = useRef(null);
  const graficoPastelRef = useRef(null);
  const dashboardGeneralRef = useRef(null);

  const [estadisticas, setEstadisticas] = useState({
    totalVentas: 0,
    totalPedidos: 0,
    ventasEfectivo: 0,
    ventasTarjeta: 0,
    productosVendidos: 0,
    cantidadVentas: 0,
    ventasPorHora: [],
    ventasPorCategoria: [],
    ventasPorDia: [],
    ventasPorMetodo: [],
    topProductos: [],
    topCategorias: [],
    ventasPorMetodoCount: [],
    ticketPromedio: 0,
    tasaExito: 0,
  });

  // Función para cargar datos - VERSIÓN CORREGIDA
  const cargarDatos = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      // Formatear fechas correctamente para Supabase
      const inicioRango = `${fechaDesde}T00:00:00`;
      const finRango = `${fechaHasta}T23:59:59`;

      console.log("Consultando ventas desde:", inicioRango, "hasta:", finRango);

      // PASO 1: Obtener ventas primero (sin relaciones anidadas complejas)
      const { data: ventas, error: errorVentas } = await supabase
        .from("ventas")
        .select("id_venta, fecha_venta, total, metodo_pago, id_empleado, id_cliente")
        .gte("fecha_venta", inicioRango)
        .lte("fecha_venta", finRango);

      if (errorVentas) {
        console.error("Error en consulta de ventas:", errorVentas);
        throw new Error(`Error al obtener ventas: ${errorVentas.message}`);
      }

      const ventasData = ventas || [];
      const totalPedidos = ventasData.length;
      console.log("Ventas encontradas:", totalPedidos);

      if (totalPedidos === 0) {
        setEstadisticas({
          totalVentas: 0,
          totalPedidos: 0,
          ventasEfectivo: 0,
          ventasTarjeta: 0,
          productosVendidos: 0,
          cantidadVentas: 0,
          ventasPorHora: [],
          ventasPorCategoria: [{ name: "Sin datos", value: 1 }],
          ventasPorDia: [],
          ventasPorMetodo: [
            { name: "Efectivo", value: 0 },
            { name: "Tarjeta", value: 0 },
          ],
          topProductos: [{ name: "Sin datos de ventas", cantidad: 0 }],
          topCategorias: [{ name: "Sin datos", total: 0 }],
          ventasPorMetodoCount: [
            { name: "Efectivo", value: 0 },
            { name: "Tarjeta", value: 0 },
          ],
          ticketPromedio: 0,
          tasaExito: 0,
        });
        setCargando(false);
        return;
      }

      // PASO 2: Obtener IDs de ventas para buscar detalles
      const idsVentas = ventasData.map(v => v.id_venta);

      // PASO 3: Obtener detalles de ventas con productos y categorías
      const { data: detalles, error: errorDetalles } = await supabase
        .from("detalles_ventas")
        .select(`
          id_detalle,
          id_venta,
          cantidad,
          precio_unitario,
          subtotal,
          id_producto
        `)
        .in("id_venta", idsVentas);

      if (errorDetalles) {
        console.error("Error en consulta de detalles:", errorDetalles);
        throw new Error(`Error al obtener detalles: ${errorDetalles.message}`);
      }

      // PASO 4: Obtener productos y categorías por separado
      const idsProductos = [...new Set(detalles?.map(d => d.id_producto) || [])];
      
      let productosMap = new Map();
      if (idsProductos.length > 0) {
        const { data: productos, error: errorProductos } = await supabase
          .from("Productos")
          .select(`
            id_Producto,
            nombre_producto,
            id_Categoria,
            categorias (
              id_Categoria,
              nombre_categoria
            )
          `)
          .in("id_Producto", idsProductos);

        if (errorProductos) {
          console.error("Error en consulta de productos:", errorProductos);
        } else {
          productos.forEach(p => {
            productosMap.set(p.id_Producto, p);
          });
        }
      }

      // Calcular métricas
      const totalVentas = ventasData.reduce((sum, v) => sum + (v.total || 0), 0);
      const ticketPromedio = totalPedidos > 0 ? totalVentas / totalPedidos : 0;
      const productosVendidos = detalles?.reduce((sum, d) => sum + (d.cantidad || 0), 0) || 0;

      // Mapas para acumulación
      const productoMap = new Map();
      const categoriaMap = new Map();
      const metodoMontoMap = new Map();
      const metodoCantidadMap = new Map();
      const horaMap = Array.from({ length: 24 }, () => 0);

      ventasData.forEach((venta) => {
        const metodo = venta.metodo_pago || "efectivo";
        metodoMontoMap.set(metodo, (metodoMontoMap.get(metodo) || 0) + (venta.total || 0));
        metodoCantidadMap.set(metodo, (metodoCantidadMap.get(metodo) || 0) + 1);

        if (venta.fecha_venta) {
          const hora = new Date(venta.fecha_venta).getHours();
          if (hora >= 0 && hora < 24) horaMap[hora] += venta.total || 0;
        }
      });

      // Procesar detalles con información de productos
      detalles?.forEach((detalle) => {
        const producto = productosMap.get(detalle.id_producto);
        if (producto) {
          const productoNombre = producto.nombre_producto || `Producto ${detalle.id_producto}`;
          productoMap.set(productoNombre, (productoMap.get(productoNombre) || 0) + (detalle.cantidad || 0));

          const categoriaNombre = producto.categorias?.nombre_categoria || "Sin categoría";
          categoriaMap.set(categoriaNombre, (categoriaMap.get(categoriaNombre) || 0) + (detalle.subtotal || 0));
        }
      });

      const topProductos = Array.from(productoMap.entries())
        .map(([name, cantidad]) => ({ name, cantidad }))
        .sort((a, b) => b.cantidad - a.cantidad)
        .slice(0, 10);

      const topCategorias = Array.from(categoriaMap.entries())
        .map(([name, total]) => ({ name, total }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      let ventasPorMetodo = Array.from(metodoMontoMap.entries()).map(([name, value]) => ({
        name: name === "efectivo" ? "Efectivo" : name === "tarjeta" ? "Tarjeta" : name,
        value,
      }));

      if (ventasPorMetodo.length === 0) {
        ventasPorMetodo = [
          { name: "Efectivo", value: 0 },
          { name: "Tarjeta", value: 0 },
        ];
      }

      const ventasPorHora = horaMap
        .map((total, index) => ({ hora: `${index.toString().padStart(2, "0")}:00`, total }))
        .slice(8, 23);

      const ventasPorCategoria = topCategorias.length > 0
        ? topCategorias.slice(0, 6).map((c) => ({ name: c.name, value: c.total }))
        : [{ name: "Sin datos", value: 1 }];

      const ventasPorMetodoCount = Array.from(metodoCantidadMap.entries()).map(([name, value]) => ({
        name: name === "efectivo" ? "Efectivo" : name === "tarjeta" ? "Tarjeta" : name,
        value,
      }));

      const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
      const ventasPorDia = diasSemana.map((dia, index) => {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() - (6 - index));
        const fechaStr = fecha.toISOString().split("T")[0];
        const ventasDia = ventasData.filter((v) => v.fecha_venta?.split("T")[0] === fechaStr);
        return {
          dia,
          ingresos: ventasDia.reduce((sum, v) => sum + (v.total || 0), 0),
          ventas: ventasDia.length,
        };
      });

      setEstadisticas({
        totalVentas,
        totalPedidos,
        ventasEfectivo: metodoMontoMap.get("efectivo") || 0,
        ventasTarjeta: metodoMontoMap.get("tarjeta") || 0,
        productosVendidos,
        cantidadVentas: totalPedidos,
        ventasPorHora,
        ventasPorCategoria,
        ventasPorDia,
        ventasPorMetodo,
        topProductos: topProductos.length > 0 ? topProductos : [{ name: "Sin datos", cantidad: 0 }],
        topCategorias: topCategorias.length > 0 ? topCategorias : [{ name: "Sin datos", total: 0 }],
        ventasPorMetodoCount: ventasPorMetodoCount.length > 0 ? ventasPorMetodoCount : [],
        ticketPromedio,
        tasaExito: totalPedidos > 0 ? 100 : 0,
      });
    } catch (err) {
      console.error("Error detallado al cargar estadísticas:", err);
      setError(`Error al cargar los datos: ${err.message || "Verifica tu conexión"}`);
    } finally {
      setCargando(false);
    }
  }, [fechaDesde, fechaHasta]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // Resto de funciones (descargarExcel, generarPDF, etc.) se mantienen igual
  const descargarExcel = async () => {
    try {
      setCargando(true);
      const wb = XLSX.utils.book_new();

      const resumen = [{
        "Fecha Desde": fechaDesde,
        "Fecha Hasta": fechaHasta,
        "Total Ventas": estadisticas.totalPedidos,
        "Ingresos Totales": estadisticas.totalVentas.toFixed(2),
        "Ticket Promedio": estadisticas.ticketPromedio.toFixed(2),
        "Productos Vendidos": estadisticas.productosVendidos,
        "Ventas Efectivo": estadisticas.ventasEfectivo.toFixed(2),
        "Ventas Tarjeta": estadisticas.ventasTarjeta.toFixed(2),
      }];
      
      const wsResumen = XLSX.utils.json_to_sheet(resumen);
      XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");

      if (estadisticas.topProductos.length > 0 && estadisticas.topProductos[0].name !== "Sin datos") {
        const wsTop = XLSX.utils.json_to_sheet(estadisticas.topProductos);
        XLSX.utils.book_append_sheet(wb, wsTop, "Top_Productos");
      }

      if (estadisticas.topCategorias.length > 0 && estadisticas.topCategorias[0].name !== "Sin datos") {
        const wsCategorias = XLSX.utils.json_to_sheet(estadisticas.topCategorias);
        XLSX.utils.book_append_sheet(wb, wsCategorias, "Top_Categorias");
      }

      XLSX.writeFile(wb, `Reporte_Ventas_${fechaDesde}_a_${fechaHasta}.xlsx`);
    } catch (err) {
      console.error("Error generando Excel:", err);
      alert("Error al generar el archivo Excel");
    } finally {
      setCargando(false);
    }
  };

  const generarPDFGraficoHoras = async () => {
    if (!graficoLineasRef.current) return;
    try {
      const canvas = await html2canvas(graficoLineasRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("l", "mm", "a4");
      doc.setFontSize(16);
      doc.text("Gráfico - Ventas por Hora", 14, 20);
      doc.setFontSize(10);
      doc.text(`Período: ${fechaDesde} al ${fechaHasta}`, 14, 30);
      doc.addImage(imgData, "PNG", 10, 40, 270, 100);
      doc.save(`grafico_ventas_hora_${fechaDesde}_a_${fechaHasta}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF del gráfico");
    }
  };

  const generarPDFGraficoPastel = async () => {
    if (!graficoPastelRef.current) return;
    try {
      const canvas = await html2canvas(graficoPastelRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");
      doc.setFontSize(16);
      doc.text("Gráfico - Ventas por Categoría", 14, 20);
      doc.setFontSize(10);
      doc.text(`Período: ${fechaDesde} al ${fechaHasta}`, 14, 30);
      doc.addImage(imgData, "PNG", 20, 40, 170, 150);
      doc.save(`grafico_ventas_categoria_${fechaDesde}_a_${fechaHasta}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      alert("Error al generar el PDF del gráfico");
    }
  };

  const generarPDFCompleto = async () => {
    if (!dashboardGeneralRef.current) return;
    try {
      setCargando(true);
      const canvas = await html2canvas(dashboardGeneralRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");
      const doc = new jsPDF("p", "mm", "a4");
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      doc.setFontSize(18);
      doc.text("Reporte General de Ventas", 14, 20);
      doc.setFontSize(10);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);
      doc.text(`Período: ${fechaDesde} al ${fechaHasta}`, 14, 36);
      doc.addImage(imgData, "PNG", 10, 45, imgWidth, imgHeight);
      
      doc.save(`reporte_completo_${fechaDesde}_a_${fechaHasta}.pdf`);
    } catch (err) {
      console.error("Error generando PDF completo:", err);
      alert("Error al generar el reporte PDF completo");
    } finally {
      setCargando(false);
    }
  };

  const formatCurrency = (value) => `C$ ${(value || 0).toFixed(2)}`;

  if (cargando && estadisticas.totalPedidos === 0) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="danger" size="lg" />
        <p className="mt-3">Cargando estadísticas...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-3 mb-5" ref={dashboardGeneralRef}>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1">
            <BarChart3 size={22} className="me-2" />
            Dashboard de Reportes
          </h2>
          <p className="text-muted">Estadísticas y análisis del negocio</p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={descargarExcel} className="rounded-pill px-4">
            <Download size={18} className="me-2" /> Excel
          </Button>
          <Button variant="danger" onClick={generarPDFCompleto} className="rounded-pill px-4">
            <Printer size={18} className="me-2" /> PDF Completo
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Row className="mb-4">
        <Col xs={12} md={4}>
          <Form.Group>
            <Form.Label className="fw-bold small">Fecha Desde</Form.Label>
            <Form.Control
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
        </Col>
        <Col xs={12} md={4}>
          <Form.Group>
            <Form.Label className="fw-bold small">Fecha Hasta</Form.Label>
            <Form.Control
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="rounded-3"
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Tarjetas KPI */}
      <Row className="g-4 mb-5">
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px", background: "linear-gradient(135deg, #dc3545, #ff6b6b)" }}>
            <Card.Body className="text-white">
              <DollarSign size={28} className="mb-2 opacity-75" />
              <h6 className="opacity-75 mb-1">Ingresos Totales</h6>
              <h2 className="fw-bold mb-0">{formatCurrency(estadisticas.totalVentas)}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px", background: "linear-gradient(135deg, #17a2b8, #20c997)" }}>
            <Card.Body className="text-white">
              <ShoppingBag size={28} className="mb-2 opacity-75" />
              <h6 className="opacity-75 mb-1">Total Ventas</h6>
              <h2 className="fw-bold mb-0">{estadisticas.totalPedidos}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px", background: "linear-gradient(135deg, #28a745, #34ce57)" }}>
            <Card.Body className="text-white">
              <Package size={28} className="mb-2 opacity-75" />
              <h6 className="opacity-75 mb-1">Productos Vendidos</h6>
              <h2 className="fw-bold mb-0">{estadisticas.productosVendidos}</h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px", background: "linear-gradient(135deg, #6f42c1, #8b46ff)" }}>
            <Card.Body className="text-white">
              <TrendingUp size={28} className="mb-2 opacity-75" />
              <h6 className="opacity-75 mb-1">Ticket Promedio</h6>
              <h2 className="fw-bold mb-0">{formatCurrency(estadisticas.ticketPromedio)}</h2>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos */}
      <Row className="g-4 mb-4">
        <Col lg={7}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <Card.Body className="p-4" ref={graficoLineasRef}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold d-flex align-items-center gap-2 mb-0">
                  <TrendingUp size={20} color="#dc3545" />
                  Ventas por Hora
                </h5>
                <Button variant="outline-danger" size="sm" onClick={generarPDFGraficoHoras} className="rounded-pill">
                  <FileText size={14} className="me-1" /> PDF
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={estadisticas.ventasPorHora} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis tickFormatter={(value) => `C$${value}`} />
                  <Tooltip formatter={(value) => [`C$ ${(value || 0).toFixed(2)}`, "Ingresos"]} />
                  <Line type="monotone" dataKey="total" stroke="#dc3545" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <Card.Body className="p-4" ref={graficoPastelRef}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold d-flex align-items-center gap-2 mb-0">
                  <PieIcon size={20} color="#28a745" />
                  Ventas por Categoría
                </h5>
                <Button variant="outline-danger" size="sm" onClick={generarPDFGraficoPastel} className="rounded-pill">
                  <FileText size={14} className="me-1" /> PDF
                </Button>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={estadisticas.ventasPorCategoria}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {estadisticas.ventasPorCategoria.map((_, index) => (
                      <Cell key={`cell-cat-${index}`} fill={COLORES_PIE[index % COLORES_PIE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`C$ ${(value || 0).toFixed(2)}`, "Total"]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tablas */}
      <Row className="g-4 mb-4">
        <Col lg={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">🏆 Top Productos Más Vendidos</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="bg-light">
                    <tr><th>#</th><th>Producto</th><th className="text-end">Cantidad</th></tr>
                  </thead>
                  <tbody>
                    {estadisticas.topProductos.map((p, i) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td>{p.name}</td>
                        <td className="text-end fw-bold text-danger">{p.cantidad} uds</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">📊 Ventas por Método</h5>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="bg-light">
                    <tr><th>Método</th><th className="text-end">Cantidad</th><th className="text-end">Monto</th></tr>
                  </thead>
                  <tbody>
                    {estadisticas.ventasPorMetodoCount.map((item, i) => {
                      const color = item.name === "Efectivo" ? "success" : "primary";
                      const monto = estadisticas.ventasPorMetodo.find((m) => m.name === item.name)?.value || 0;
                      return (
                        <tr key={i}>
                          <td><Badge bg={color} className="rounded-pill px-3 py-2">{item.name}</Badge></td>
                          <td className="text-end fw-bold">{item.value}</td>
                          <td className="text-end fw-bold text-success">{formatCurrency(monto)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={12}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: "24px" }}>
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                <Gift size={20} color="#ffc107" />
                Top Categorías por Ingresos
              </h5>
              {estadisticas.topCategorias.length > 0 && estadisticas.topCategorias[0].name !== "Sin datos" ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={estadisticas.topCategorias} margin={{ top: 10, right: 20, left: 0, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} interval={0} />
                    <YAxis tickFormatter={(value) => `C$${value}`} />
                    <Tooltip formatter={(value) => [`C$ ${(value || 0).toFixed(2)}`, "Ingresos"]} />
                    <Bar dataKey="total" fill="#ffc107" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5">
                  <Gift size={48} className="text-muted mb-3" />
                  <p className="text-muted">No hay datos de categorías vendidas en este período</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ReportesAdminView;