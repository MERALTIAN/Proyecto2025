import React, { useState, useMemo } from "react";
import { Modal, Row, Col, Form, Button, Card, ListGroup } from "react-bootstrap";
import AsyncSelect from "react-select/async";

const ModalVenta = ({
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

  const cargarProductos = useMemo(
    () => (inputValue) => {
      const search = (inputValue || "").toLowerCase();
      return Promise.resolve(
        productos
          .filter((p) =>
            `${p.nombre_producto || ""}`.toLowerCase().includes(search)
          )
          .map((p) => ({
            value: p.id_producto,
            label: `${p.nombre_producto} - C$${p.precio_venta}`,
            data: p,
          }))
      );
    },
    [productos]
  );

  const handleAgregar = () => {
    if (productoSeleccionado && cantidad > 0) {
      agregarDetalle(productoSeleccionado.data, cantidad);
      setCantidad(1);
      setProductoSeleccionado(null);
    }
  };

  return (
    <Modal show={mostrar} onHide={() => setMostrar(false)} backdrop="static" size="xl" centered fullscreen="lg-down">
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
                    value={clienteSeleccionado ? {
                      value: clienteSeleccionado.id_cliente,
                      label: `${clienteSeleccionado.nombre_cliente} ${clienteSeleccionado.apellido_cliente} - ${clienteSeleccionado.celular || "Sin celular"}`,
                      data: clienteSeleccionado,
                    } : null}
                    onChange={(selected) => setClienteSeleccionado(selected?.data || null)}
                    placeholder="Selecciona un cliente"
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
                    value={empleadoSeleccionado ? {
                      value: empleadoSeleccionado.id_empleado,
                      label: `${empleadoSeleccionado.nombre_empleado} ${empleadoSeleccionado.apellido_empleado}`,
                      data: empleadoSeleccionado,
                    } : null}
                    onChange={(selected) => setEmpleadoSeleccionado(selected?.data || null)}
                    placeholder="Selecciona un empleado"
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
                      <AsyncSelect
                        cacheOptions
                        defaultOptions
                        loadOptions={cargarProductos}
                        value={productoSeleccionado}
                        onChange={(selected) => setProductoSeleccionado(selected || null)}
                        placeholder="Selecciona un producto"
                        isClearable
                        menuPlacement="auto"
                        noOptionsMessage={() => "No se encontraron productos"}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6} lg={3}>
                    <Form.Group>
                      <Form.Label>Cantidad</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value))}
                      />
                    </Form.Group>
                  </Col>

                  <Col xs={6} lg={2} className="d-grid">
                    <Button
                      variant="primary"
                      onClick={handleAgregar}
                      disabled={!productoSeleccionado || cantidad < 1}
                      className="w-100"
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
                  <h5 className="mb-0">Detalles de la Venta</h5>
                  <span className="text-muted small">{detalles.length} artículo(s)</span>
                </div>
              </Card.Header>

              <Card.Body className="p-0" style={{ maxHeight: "450px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {detalles.length === 0 ? (
                    <ListGroup.Item className="text-center text-muted py-5">
                      No hay productos agregados.
                    </ListGroup.Item>
                  ) : (
                    detalles.map((detalle) => (
                      <ListGroup.Item key={detalle.id_producto} className="py-3">
                        <Row className="align-items-center gx-3">
                          <Col xs={12} lg={6}>
                            <div className="fw-semibold">{detalle.nombre_producto}</div>
                            <div className="small text-muted">Producto seleccionado</div>
                          </Col>
                          <Col xs={4} lg={2} className="text-center">
                            <div className="fw-semibold">{detalle.cantidad}</div>
                            <div className="small text-muted">Cantidad</div>
                          </Col>
                          <Col xs={4} lg={2} className="text-center">
                            <div className="fw-semibold">C$ {detalle.precio.toFixed(2)}</div>
                            <div className="small text-muted">Unitario</div>
                          </Col>
                          <Col xs={4} lg={2} className="text-center">
                            <div className="fw-semibold">C$ {(detalle.precio * detalle.cantidad).toFixed(2)}</div>
                            <div className="small text-muted">Subtotal</div>
                          </Col>
                        </Row>
                        <Row className="align-items-center gx-2 mt-3">
                          <Col xs={7} sm={6}>
                            <Form.Control
                              type="number"
                              min={1}
                              value={detalle.cantidad}
                              onChange={(e) => actualizarCantidad(detalle.id_producto, Number(e.target.value))}
                            />
                          </Col>
                          <Col xs={5} sm={6} className="text-end">
                            <Button variant="outline-danger" size="sm" onClick={() => eliminarDetalle(detalle.id_producto)}>
                              <i className="bi bi-trash"></i>
                            </Button>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>
              </Card.Body>

              <Card.Footer className="bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="text-muted small">Total</div>
                    <div className="fw-semibold">C$ {totalGeneral.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-muted small">Productos</div>
                    <div className="fw-semibold">{detalles.length}</div>
                  </div>
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
        <Button
          variant="primary"
          onClick={guardarVenta}
          disabled={!clienteSeleccionado || !empleadoSeleccionado || detalles.length === 0}
        >
          {ventaAEditar ? "Actualizar Venta" : "Registrar Venta"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalVenta;
