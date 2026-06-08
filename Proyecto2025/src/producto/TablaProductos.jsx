import React from "react";
import { Table, Spinner, Button, Image, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaProductos = ({
  productos = [],
  categorias = [],
  abrirModalEdicion,
  abrirModalEliminacion,
  copiarProducto,
  generarQRImagen,
}) => {
  const loading = productos.length === 0;

  const categoriaMap = new Map(
    categorias.map((categoria) => [
      categoria.id_Categoria,
      categoria.nombre_categoria,
    ])
  );

  if (loading) {
    return (
      <div className="text-center">
        <h4>Cargando productos...</h4>
        <Spinner animation="border" variant="success" role="status" />
      </div>
    );
  }

  return (
    <Table className="product-table mb-0" striped hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Imagen</th>
          <th>Nombre</th>
          <th className="d-none d-md-table-cell">Descripción</th>
          <th>Categoría</th>
          <th>Precio</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {productos.map((producto) => {
          const categoriaNombre =
            categoriaMap.get(producto.id_Categoria) || "Sin categoría";

          return (
            <tr key={producto.id_Producto}>
              <td>{producto.id_Producto}</td>

              <td>
                {producto.url_imagen ? (
                  <Image
                    src={producto.url_imagen}
                    alt={producto.nombre_producto}
                    rounded
                    style={{
                      width: "55px",
                      height: "55px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="bg-light d-flex align-items-center justify-content-center rounded"
                    style={{
                      width: "55px",
                      height: "55px",
                    }}
                  >
                    <i className="bi bi-image text-muted"></i>
                  </div>
                )}
              </td>

              <td className="fw-semibold">
                {producto.nombre_producto || "Producto sin nombre"}
              </td>

              <td className="d-none d-md-table-cell">
                {producto.descripcion_producto || "Sin descripción"}
              </td>

              <td>
                <Badge bg="info" className="text-uppercase">
                  {categoriaNombre}
                </Badge>
              </td>

              <td className="fw-semibold">
                C$ {Number(producto.precio_venta || 0).toFixed(2)}
              </td>

              <td className="text-center">
                <Button
                  variant="outline-info"
                  size="sm"
                  className="me-1"
                  onClick={() => copiarProducto(producto)}
                  title="Copiar producto"
                >
                  <i className="bi bi-clipboard"></i>
                </Button>

                <Button
                  variant="outline-success"
                  size="sm"
                  className="me-1"
                  onClick={() => generarQRImagen(producto)}
                  title="Generar QR"
                >
                  <i className="bi bi-qr-code"></i>
                </Button>

                <Button
                  variant="outline-warning"
                  size="sm"
                  className="me-1"
                  onClick={() => abrirModalEdicion(producto)}
                  title="Editar producto"
                >
                  <i className="bi bi-pencil"></i>
                </Button>

                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => abrirModalEliminacion(producto)}
                  title="Eliminar producto"
                >
                  <i className="bi bi-trash"></i>
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default TablaProductos;