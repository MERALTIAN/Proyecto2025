import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaClientes = ({
  clientes,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  if (!clientes) {
    return (
      <div className="text-center">
        <h4>Cargando clientes...</h4>
        <Spinner animation="border" variant="success" role="status" />
      </div>
    );
  }

  if (clientes.length === 0) {
    return (
      <div className="text-center my-5">
        <h4>No hay clientes para mostrar.</h4>
      </div>
    );
  }

  return (
    <Table striped borderless hover responsive size="sm">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Celular</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {clientes.map((cliente) => (
          <tr key={cliente.id_cliente} className="align-middle">
            <td>{cliente.id_cliente}</td>
            <td>{cliente.nombre_cliente}</td>
            <td>{cliente.apellido_cliente || "—"}</td>
            <td>{cliente.celular}</td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(cliente)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEliminacion(cliente)}
              >
                <i className="bi bi-trash"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaClientes;
