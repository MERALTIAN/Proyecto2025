import React, { useState, useMemo } from "react";
import { Modal, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";
import AsyncSelect from "react-select/async";

const FormularioVenta = ({
  mostrar,
  setMostrar,
  clientes,
  empleados,
  productos,
  clienteSeleccionado,
  setClienteSeleccionado,
  empleadoSeleccionado,
  setEmpleadoSeleccionado,
  metodoPago,
  setMetodoPago,
  detalles,
  totalGeneral,
  agregarDetalle,
  eliminarDetalle,
  actualizarCantidad,
  guardarVenta,
  ventaAEditar,
}) => {
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidad, setCantidad] = useState(1);

  const cargarClientes = useMemo(
    () => (inputValue) => {
      const search = (inputValue || "").toLowerCase();
      return Promise.resolve(
        clientes
          .filter((cli) =>
            `${cli.nombre_cliente || ""} ${cli.apellido_cliente || ""} ${cli.celular || ""}`
              .toLowerCase()
              .includes(search)
          )
          .map((cli) => ({
            value: cli.id_cliente,
            label: `${cli.nombre_cliente} ${cli.apellido_cliente} - ${cli.celular || "Sin celular"}`,
            data: cli,
          }))
      );
    },
    [clientes]
  );

  const cargarEmpleados = useMemo(
    () => (inputValue) => {
      const search = (inputValue || "").toLowerCase();
      return Promise.resolve(
        empleados
          .filter((emp) =>
            `${emp.nombre_empleado || ""} ${emp.apellido_empleado || ""}`
              .toLowerCase()
              .includes(search)
          )
          .map((emp) => ({
            value: emp.id_empleado,
            label: `${emp.nombre_empleado} ${emp.apellido_empleado}`,
            data: emp,
          }))
      );
    },
    [empleados]
  );

  const handleAgregar = () => {
    if (productoSeleccionado && cantidad > 0) {
      agregarDetalle(productoSeleccionado.data, cantidad);
      setCantidad(1);
      setProductoSeleccionado(null);
    }
  };

  return (
    <Modal show={mostrar} onHide={() => setMostrar(false)} backdrop="static" size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>{ventaAEditar ? "Editar Venta" : "Nueva Venta"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row className="g-4">
          <Col lg={7} md={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1">Datos de la Venta</h5>
                    <small className="text-muted">Completa los datos y agrega los productos de la venta</small>
                  </div>
                  <div className="text-end text-muted">
                    <div>{ventaAEditar ? "Editar registro" : "Nueva venta"}</div>
                    <div className="small">Total: C$ {totalGeneral.toFixed(2)}</div>
                  </div>
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={cargarClientes}
                    value={
                      clienteSeleccionado
                        ? {
                            value: clienteSeleccionado.id_cliente,
                            label: `${clienteSeleccionado.nombre_cliente} ${clienteSeleccionado.apellido_cliente} - ${clienteSeleccionado.celular || "Sin celular"}`,
                            data: clienteSeleccionado,
                          }
                        : null
                    }
                    onChange={(selected) => setClienteSeleccionado(selected?.data || null)}
                    placeholder="Buscar cliente por nombre o celular..."
                    isClearable
                    menuPlacement="auto"
                    noOptionsMessage={() => "No se encontraron clientes"}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Empleado / Mesero *</Form.Label>
                  <AsyncSelect
                    cacheOptions
                    defaultOptions
                    loadOptions={cargarEmpleados}
                    value={
                      empleadoSeleccionado
                        ? {
                            value: empleadoSeleccionado.id_empleado,
                            label: `${empleadoSeleccionado.nombre_empleado} ${empleadoSeleccionado.apellido_empleado}`,
                            data: empleadoSeleccionado,
                          }
                        : null
                    }
                    onChange={(selected) => setEmpleadoSeleccionado(selected?.data || null)}
                    placeholder="Buscar empleado..."
                    isClearable
                    menuPlacement="auto"
                    noOptionsMessage={() => "No se encontraron empleados"}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select value={metodoPago} onChange={(e) => setMetodoPago(e.target.value)}>
                    <option value="efectivo">Efectivo</option>
                    <option value="tarjeta">Tarjeta</option>
                    <option value="transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>

                <hr />

                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h5 className="mb-1">Agregar Producto</h5>
                    <small className="text-muted">Selecciona un producto y añade la cantidad deseada.</small>
                  </div>
                </div>

                <Row className="align-items-end g-3">
                  <Col xs={12} lg={7}>
                    <Form.Group>
                      <Form.Label>Producto</Form.Label>
                      <Form.Select
                        value={productoSeleccionado?.value ?? ""}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const producto = productos.find(
                            (p) => (p.id_producto ?? p.id_Producto)?.toString() === selectedId
                          );
                          setProductoSeleccionado(
                            producto
                              ? {
                                  value: producto.id_producto ?? producto.id_Producto,
                                  label: `${producto.nombre_producto || producto.nombre_Producto || "Producto sin nombre"} - C$${producto.precio_venta ?? producto.precio ?? 0}`,
                                  data: producto,
                                }
                              : null
                          );
                        }}
                      >
                        <option value="">Selecciona un producto</option>
                        {productos.length > 0 ? (
                          productos.map((producto) => {
                            const id = producto.id_producto ?? producto.id_Producto;
                            return (
                              <option key={id} value={id}>
                                {`${producto.nombre_producto || producto.nombre_Producto || "Producto sin nombre"} - C$${producto.precio_venta ?? producto.precio ?? 0}`}
                              </option>
                            );
                          })
                        ) : (
                          <option value="">No hay productos disponibles</option>
                        )}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col xs={6} lg={3}>
                    <Form.Group>
                      <Form.Label>Cantidad</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        value={cantidad}
                        onChange={(e) => setCantidad(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6} lg={2} className="d-grid">
                    <Button
                      variant="primary"
                      onClick={handleAgregar}
                      disabled={!productoSeleccionado || cantidad < 1}
                    >
                      Agregar
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5} md={12}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Productos en esta venta</h5>
                  <span className="text-muted small">{detalles.length} artículo(s)</span>
                </div>
              </Card.Header>

              <Card.Body className="p-0" style={{ maxHeight: "450px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {detalles.length === 0 ? (
                    <ListGroup.Item className="text-center text-muted py-5">
                      No hay productos agregados aún.
                    </ListGroup.Item>
                  ) : (
                    detalles.map((det) => (
                      <ListGroup.Item key={det.id_producto} className="py-3">
                        <Row className="align-items-center gx-3">
                          <Col xs={12} lg={6}>
                            <div className="fw-semibold">{det.nombre_producto}</div>
                            <div className="small text-muted">Cantidad: {det.cantidad}</div>
                          </Col>
                          <Col xs={6} lg={3} className="text-center">
                            <div className="fw-semibold">C$ {det.precio.toFixed(2)}</div>
                            <div className="small text-muted">Precio unitario</div>
                          </Col>
                          <Col xs={6} lg={3} className="text-end">
                            <div className="fw-semibold">C$ {(det.cantidad * det.precio).toFixed(2)}</div>
                            <div>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => eliminarDetalle(det.id_producto)}
                              >
                                Eliminar
                              </Button>
                            </div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Card.Body>

              <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="fw-semibold">Total:</div>
                  <div className="fw-bold">C$ {totalGeneral.toFixed(2)}</div>
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrar(false)}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={guardarVenta}>
          {ventaAEditar ? "Actualizar Venta" : "Registrar Venta"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FormularioVenta;
