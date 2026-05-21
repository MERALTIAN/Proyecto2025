import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

function Encabezado() {
  const navigate = useNavigate();
  const { tienePermiso, logout, usuario, cargando } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const estiloHeader = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    width: "100%",
    minHeight: "60px",
    background: "linear-gradient(90deg, #0d6efd, #6610f2)",
    color: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
  };

  const estiloLogo = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const estiloBotonMenu = {
    border: "1px solid rgba(255,255,255,0.7)",
    background: "rgba(255,255,255,0.12)",
    color: "white",
    borderRadius: "8px",
    padding: "7px 12px",
    cursor: "pointer",
    fontSize: "22px",
    lineHeight: "1",
  };

  const estiloMenu = {
    position: "absolute",
    top: "65px",
    right: "18px",
    width: "230px",
    background: "white",
    color: "#111",
    borderRadius: "12px",
    boxShadow: "0 8px 25px rgba(0,0,0,0.25)",
    padding: "10px",
    display: menuAbierto ? "flex" : "none",
    flexDirection: "column",
    gap: "6px",
    zIndex: 2000,
  };

  const estiloLink = {
    color: "#111",
    textDecoration: "none",
    fontWeight: "700",
    padding: "10px 12px",
    borderRadius: "8px",
  };

  const estiloBotonCerrar = {
    border: "none",
    background: "#dc3545",
    color: "white",
    borderRadius: "8px",
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: "700",
    textAlign: "left",
  };

  const cerrarSesion = async () => {
    await logout();
    setMenuAbierto(false);
    navigate("/login");
  };

  const cerrarMenu = () => {
    setMenuAbierto(false);
  };

  if (cargando) return null;

  return (
    <header style={estiloHeader}>
      <div style={estiloLogo}>
        <img src={logo} alt="logo" width="44" style={{ borderRadius: "8px" }} />
        <strong>Mi sistema</strong>
      </div>

      <button
        style={estiloBotonMenu}
        onClick={() => setMenuAbierto((estado) => !estado)}
        aria-label="Abrir menú"
      >
        ☰
      </button>

      <nav style={estiloMenu}>
        {usuario ? (
          <>
            {tienePermiso("ver_inicio") && (
              <Link to="/" style={estiloLink} onClick={cerrarMenu}>
                Inicio
              </Link>
            )}

            {tienePermiso("ver_catalogo") && (
              <Link to="/catalogo" style={estiloLink} onClick={cerrarMenu}>
                Catálogo
              </Link>
            )}

            {tienePermiso("ver_productos") && (
              <Link to="/productos" style={estiloLink} onClick={cerrarMenu}>
                Productos
              </Link>
            )}

            {tienePermiso("ver_categorias") && (
              <Link to="/categorias" style={estiloLink} onClick={cerrarMenu}>
                Categorías
              </Link>
            )}

            {tienePermiso("ver_empleados") && (
              <Link to="/empleados" style={estiloLink} onClick={cerrarMenu}>
                Empleados
              </Link>
            )}

            {tienePermiso("ver_permisos") && (
              <Link to="/permisos" style={estiloLink} onClick={cerrarMenu}>
                Permisos
              </Link>
            )}

            <button style={estiloBotonCerrar} onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <Link to="/login" style={estiloLink} onClick={cerrarMenu}>
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Encabezado;