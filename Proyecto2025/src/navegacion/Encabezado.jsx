import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/logo.png";

function Encabezado() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState(
    JSON.parse(localStorage.getItem("usuario"))
  );

  const cerrarSesion = () => {
    localStorage.removeItem("usuario");
    setUsuario(null);
    navigate("/login");
  };

  return (
    <header style={{ display: "flex", gap: "20px", padding: "10px" }}>
      <img src={logo} alt="logo" width="50" />

      <Link to="/">Inicio</Link>
      <Link to="/catalogo">Catálogo</Link>

      {usuario && (
        <>
          <Link to="/productos">Productos</Link>
          <Link to="/categorias">Categorías</Link>
          <button onClick={cerrarSesion}>Cerrar sesión</button>
        </>
      )}

      {!usuario && <Link to="/login">Login</Link>}
    </header>
  );
}

export default Encabezado;