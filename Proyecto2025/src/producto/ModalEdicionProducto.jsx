import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionProducto = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  productoEditar,
  manejoCambioInputEdicion,
  manejoCambioArchivoEdicion,
  actualizarProducto,
  categorias,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await actualizarProducto();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
      size="lg"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Producto</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Categoría *</Form.Label>
                <Form.Select
                  name="id_Categoria"
                  value={productoEditar.id_Categoria || ""}
                  onChange={manejoCambioInputEdicion}
                >
                  <option value="">Seleccione...</option>
                  {categorias.map((cat) => (
                    <option key={cat.id_Categoria} value={cat.id_Categoria}>
                      {cat.nombre_categoria}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_producto"
                  value={productoEditar.nombre_producto || ""}
                  onChange={manejoCambioInputEdicion}
                  placeholder="Nombre del producto"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Precio de venta *</Form.Label>
                <Form.Control
                  type="number"
                  min="0"
                  name="precio_venta"
                  value={productoEditar.precio_venta || ""}
                  onChange={manejoCambioInputEdicion}
                  placeholder="Precio de venta"
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cambiar imagen</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={manejoCambioArchivoEdicion}
                />
              </Form.Group>
            </Col>

            {productoEditar.url_imagen && (
              <Col xs={12}>
                <div className="mb-3">
                  <Form.Label>Imagen actual</Form.Label>
                  <br />
                  <img
                    src={productoEditar.url_imagen}
                    alt={productoEditar.nombre_producto}
                    style={{
                      width: "160px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                </div>
              </Col>
            )}

            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="descripcion_producto"
                  value={productoEditar.descripcion_producto || ""}
                  onChange={manejoCambioInputEdicion}
                  placeholder="Descripción del producto"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={
            !productoEditar.nombre_producto?.trim() ||
            !productoEditar.id_Categoria ||
            !productoEditar.precio_venta ||
            deshabilitado
          }
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionProducto;