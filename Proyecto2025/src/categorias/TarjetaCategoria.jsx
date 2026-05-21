import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCategoria = ({
  categorias = [],
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const cargando = categorias == null;
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
  };

  return (
    <>
      {cargando ? (
        <div className="text-center my-5">
          <h5>Cargando categorías...</h5>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <div>
          {categorias.map((categoria) => {
            const categoriaId =
              categoria.id_Categoria ?? categoria.id_categoria;

            const tarjetaActiva = idTarjetaActiva === categoriaId;

            return (
              <Card
                key={categoriaId}
                className="mb-2 border-0 rounded-3 shadow-sm w-100 position-relative overflow-hidden"
                onClick={() => alternarTarjetaActiva(categoriaId)}
                tabIndex={0}
                onKeyDown={(evento) => {
                  if (evento.key === "Enter" || evento.key === " ") {
                    evento.preventDefault();
                    alternarTarjetaActiva(categoriaId);
                  }
                }}
                aria-label={`Categoría ${categoria.nombre_categoria}`}
                aria-pressed={tarjetaActiva}
                style={{ cursor: "pointer" }}
              >
                <Card.Body className="p-2">
                  <Row className="align-items-center gx-2">
                    <Col xs={2}>
                      <div
                        className="bg-light d-flex align-items-center justify-content-center rounded"
                        style={{
                          height: "45px",
                          width: "45px",
                        }}
                      >
                        <i className="bi bi-bookmark text-muted fs-4"></i>
                      </div>
                    </Col>

                    <Col xs={7} className="text-start">
                      <div className="fw-semibold text-truncate">
                        {categoria.nombre_categoria}
                      </div>

                      <div className="small text-muted text-truncate">
                        {categoria.descripcion_categoria}
                      </div>
                    </Col>

                    <Col xs={3} className="text-end">
                      <div className="fw-semibold small">Activa</div>
                    </Col>
                  </Row>
                </Card.Body>

                {tarjetaActiva && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                    style={{
                      background: "rgba(255, 255, 255, 0.82)",
                      backdropFilter: "blur(2px)",
                      zIndex: 10,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdTarjetaActiva(null);
                    }}
                  >
                    <div
                      className="d-flex align-items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => {
                          abrirModalEdicion(categoria);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Editar ${categoria.nombre_categoria}`}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          abrirModalEliminacion(categoria);
                          setIdTarjetaActiva(null);
                        }}
                        aria-label={`Eliminar ${categoria.nombre_categoria}`}
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
      )}
    </>
  );
};

export default TarjetaCategoria;