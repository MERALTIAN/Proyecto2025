import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaCategorias = ({
  categorias = [],
  abrirModalEdicion,
  abrirModalEliminacion
}) => {
  const loading = categorias == null;

  return (
    <>
      {loading ? (
        <div className="text-center">
          <h4>Cargando categorías...</h4>
          <Spinner animation="border" variant="success" role="status" />
        </div>
      ) : (
        <Table className="category-table mb-0" striped hover responsive size="sm">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th className="d-none d-md-table-cell">Descripción</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id_Categoria ?? categoria.id_categoria}>
                <td>{categoria.id_Categoria ?? categoria.id_categoria}</td>
                <td>{categoria.nombre_categoria}</td>
                <td className="d-none d-md-table-cell">{categoria.descripcion_categoria}</td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() => abrirModalEdicion(categoria)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(categoria)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default TablaCategorias;