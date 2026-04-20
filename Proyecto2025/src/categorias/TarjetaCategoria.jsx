import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCategoria = ({
  categorias,
  abrirModalEdicion,
  abrirModalEliminacion
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(categorias && categorias.length > 0));
  }, [categorias]);

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
            const categoriaId = categoria.id_Categoria ?? categoria.id_categoria;
            const tarjetaActiva = idTarjetaActiva === categoriaId;

            return (
              <Card
                key={categoriaId}
                className={`mb-3 border-0 rounded-3 shadow-sm w-100 tarjeta-categoria-contenedor ${
                  tarjetaActiva ? "tarjeta-categoria-activa" : ""
                }`}
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
              >
                <Card.Body
                  className={`p-2 tarjeta-categoria-cuerpo ${
                    tarjetaActiva
                      ? "tarjeta-categoria-cuerpo-activo"
                      : "tarjeta-categoria-cuerpo-inactivo"
                  }`}
                >
                  <Row className="align-items-center gx-3">
                    <Col xs={2} className="px-2">
                      <div 
                      className="bg-light d-flex align-items-center justify-content-center rounded tarjeta-categoria-placeholder-imagen">
                        <i className="bi bi-bookmark text-muted fs-3"></i>
                      </div>
                    </Col>

                    <Col xs={5} className="text-start">
                      <div className="fw-semibold text-truncate">
                        {categoria.nombre_categoria}
                      </div>
                      <div className="small text-muted text-truncate">
                        {categoria.descripcion_categoria}
                      </div>
                    </Col>

                    <Col
                      xs={5}
                      className="d-flex flex-column align-items-end justify-content-center text-end"
                    >
                      <div className="fw-semibold small">Activa</div>
                    </Col>
                  </Row>
                </Card.Body>

                {tarjetaActiva && (
                  <div
                    role="dialog"
                    aria-modal="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIdTarjetaActiva(null);
                    }}
                    className="tarjeta-categoria-capa"
                  >
                    <div
                      className="d-flex flex-column align-items-center gap-3 tarjeta-categoria-botones-capa"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="d-flex align-items-center gap-2 text-secondary">
                        <i className="bi bi-lock-fill fs-5"></i>
                        <span className="fw-semibold">Seleccionada</span>
                      </div>
                      <div className="d-flex gap-2">
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