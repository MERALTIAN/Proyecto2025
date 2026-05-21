import React from "react";
import { Table, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaEmpleados = ({ 
  empleados,
  abrirModalEdicion 
}) => {
  if (!empleados) {
    return (
      <div className="text-center">
        <h4>Cargando empleados...</h4>
        <Spinner animation="border" variant="success" role="status" />
      </div>
    );
  }

  if (empleados.length === 0) {
    return (
      <div className="text-center my-5">
        <h4>No hay empleados para mostrar.</h4>
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
          <th>Email</th>
          <th className="d-none d-md-table-cell">Celular</th>
          <th className="d-none d-md-table-cell">PIN</th>
          <th className="d-none d-md-table-cell">Rol</th>
          <th className="text-center">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {empleados.map((empleado) => (
          <tr key={empleado.id_empleado} className="align-middle">
            <td>{empleado.id_empleado}</td>
            <td>{empleado.nombre_empleado}</td>
            <td>{empleado.apellido_empleado}</td>
            <td>{empleado.email}</td>
            <td className="d-none d-md-table-cell">{empleado.celular || "-"}</td>
            <td className="d-none d-md-table-cell">{empleado.pin || "-"}</td>
            <td className="d-none d-md-table-cell">
              <span className="badge bg-primary">{empleado.tipo_empleado}</span>
            </td>
            <td className="text-center">
              <Button
                variant="outline-warning"
                size="sm"
                className="m-1"
                onClick={() => abrirModalEdicion(empleado)}
              >
                <i className="bi bi-pencil"></i>
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default TablaEmpleados;