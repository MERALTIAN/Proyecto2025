import React, { useState, useCallback, useEffect } from "react";
import { Card, Row, Col, Badge, Button, Spinner } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetasProductos = ({
  productos = [],
  categorias = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const cargando = productos.length === 0;
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, [setIdTarjetaActiva]);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const categoriaMap = new Map(
    categorias.map((c) => [c.id_Categoria, c.nombre_categoria])
  );

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((prev) => (prev === id ? null : id));
  };

  if (cargando) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  return (
    <div>
      {productos.map((producto) => {
        const productoId = producto.id_Producto;
        const imagenUrl = producto.url_imagen || "";
        const activa = idTarjetaActiva === productoId;

        const categoriaNombre =
          categoriaMap.get(producto.id_Categoria) || "Sin categoría";

        return (
          <Card
            key={productoId}
            className="mb-1 border-0 shadow-sm position-relative"
            onClick={() => alternarTarjetaActiva(productoId)}
            style={{ cursor: "pointer" }}
          >
            <Card.Body className="p-1">
              <Row className="align-items-center gx-1">

                {/* IMAGEN */}
                <Col xs={3}>
                  <div
                    style={{
                      height: "55px",
                      width: "100%",
                      overflow: "hidden",
                      borderRadius: "6px",
                    }}
                  >
                    {imagenUrl ? (
                      <img
                        src={imagenUrl}
                        alt={producto.nombre_producto}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="bg-light d-flex justify-content-center align-items-center h-100">
                        <i className="bi bi-image text-muted"></i>
                      </div>
                    )}
                  </div>
                </Col>

                {/* TEXTO */}
                <Col xs={6}>
                  <div className="fw-semibold small text-truncate">
                    {producto.nombre_producto}
                  </div>

                  <div className="text-muted" style={{ fontSize: "11px" }}>
                    {producto.descripcion_producto}
                  </div>

                  <Badge bg="info" style={{ fontSize: "10px" }}>
                    {categoriaNombre}
                  </Badge>
                </Col>

                {/* PRECIO */}
                <Col xs={3} className="text-end">
                  <div style={{ fontSize: "13px", fontWeight: "600" }}>
                    C$ {Number(producto.precio_venta || 0).toFixed(2)}
                  </div>
                </Col>
              </Row>
            </Card.Body>

            {/* OVERLAY */}
            {activa && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                style={{
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(2px)",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdTarjetaActiva(null);
                }}
              >
                <div
                  className="d-flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="warning"
                    onClick={() => {
                      abrirModalEdicion(producto);
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => {
                      abrirModalEliminacion(producto);
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default TarjetasProductos;