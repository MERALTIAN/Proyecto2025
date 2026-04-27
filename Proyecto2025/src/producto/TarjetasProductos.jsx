import React from "react";
import { Row, Col, Card, Badge, Button } from "react-bootstrap";

const TarjetasProductos = ({
  productos = [],
  categorias = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const categoriaMap = new Map(
    categorias.map((categoria) => [
      categoria.id_Categoria,
      categoria.nombre_categoria,
    ])
  );

  if (!productos || productos.length === 0) {
    return (
      <div className="text-center py-5">
        <h5>No se encontraron productos.</h5>
      </div>
    );
  }

  return (
    <Row xs={1} sm={2} md={2} lg={3} className="g-3">
      {productos.map((producto) => {
        const imagenUrl = producto.url_imagen || "";

        const categoriaNombre =
          categoriaMap.get(producto.id_Categoria) || "Sin categoría";

        return (
          <Col key={producto.id_Producto}>
            <Card className="h-100 shadow-sm border-0">
              {imagenUrl ? (
                <div style={{ height: "220px", overflow: "hidden" }}>
                  <Card.Img
                    variant="top"
                    src={imagenUrl}
                    alt={producto.nombre_producto}
                    style={{
                      objectFit: "cover",
                      width: "100%",
                      height: "220px",
                    }}
                  />
                </div>
              ) : (
                <div
                  className="bg-light d-flex align-items-center justify-content-center"
                  style={{ height: "220px" }}
                >
                  <span className="text-muted">Sin imagen</span>
                </div>
              )}

              <Card.Body className="d-flex flex-column">
                <Card.Title className="mb-2 fs-5">
                  {producto.nombre_producto || "Producto sin nombre"}
                </Card.Title>

                <div className="mb-2 text-muted small">
                  {producto.descripcion_producto || "Descripción no disponible."}
                </div>

                <div className="mt-auto">
                  <Badge bg="info" className="mb-2 text-uppercase">
                    {categoriaNombre}
                  </Badge>

                  <div className="fw-semibold fs-5 mb-3">
                    C$ {Number(producto.precio_venta || 0).toFixed(2)}
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => abrirModalEdicion(producto)}
                    >
                      Editar
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => abrirModalEliminacion(producto)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};

export default TarjetasProductos;