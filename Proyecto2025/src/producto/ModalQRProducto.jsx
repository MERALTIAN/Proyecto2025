import React from "react";
import { Modal, Button } from "react-bootstrap";
import QRCode from "react-qr-code";

const ModalQRProducto = ({ mostrar, producto, onCerrar }) => {
  if (!mostrar || !producto) return null;

  const qrValue = JSON.stringify({
    id: producto.id_Producto,
    nombre: producto.nombre_producto,
    descripcion: producto.descripcion_producto || "",
    precio: producto.precio_venta,
    categoria_id: producto.id_Categoria,
  });

  return (
    <Modal show={mostrar} onHide={onCerrar} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-qr-code me-2"></i>
          QR - {producto.nombre_producto}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <div className="d-flex justify-content-center p-3 bg-light rounded">
          <QRCode value={qrValue} size={200} />
        </div>
        <p className="text-muted mt-3 mb-0 small">
          Escanea para ver la información del producto
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onCerrar}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalQRProducto;