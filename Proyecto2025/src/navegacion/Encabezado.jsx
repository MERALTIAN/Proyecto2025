import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/logo.png";

function Encabezado() {
  const navigate = useNavigate();
  const location = useLocation();

  const [usuario, setUsuario] = useState(
    localStorage.getItem("usuario-supabase") || null
  );

  const estiloHeader = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    padding: "10px 24px",
    width: "100%",
    minHeight: "60px",
    background: "linear-gradient(90deg, #0d6efd, #6610f2)",
    color: "white",
    boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
  };

  const estiloNav = {
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    alignItems: "center",
  };

  const estiloLink = {
    color: "white",
    textDecoration: "none",
    fontWeight: "700",
    transition: "transform 0.2s, color 0.2s",
  };

  const estiloBoton = {
    border: "1px solid rgba(255,255,255,0.95)",
    background: "rgba(255,255,255,0.14)",
    color: "white",
    borderRadius: "8px",
    padding: "7px 14px",
    cursor: "pointer",
    fontWeight: "600",
    transition: "background 0.2s, transform 0.2s",
  };


  useEffect(() => {
    const handleStorage = () => {
      setUsuario(localStorage.getItem("usuario-supabase") || null);
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    setUsuario(localStorage.getItem("usuario-supabase") || null);
  }, [location]);

  const cerrarSesion = () => {
    localStorage.removeItem("usuario-supabase");
    setUsuario(null);
    navigate("/login");
  };

  return (
    <header style={estiloHeader}>
      <div style={estiloNav}>
        <img src={logo} alt="logo" width="44" style={{ borderRadius: "8px" }} />
        {usuario && (
          <>
            <Link to="/" style={estiloLink}>
              Inicio
            </Link>
            <Link to="/catalogo" style={estiloLink}>
              Catálogo
            </Link>
            <Link to="/productos" style={estiloLink}>
              Productos
            </Link>
            <Link to="/categorias" style={estiloLink}>
              Categorías
            </Link>
          </>
        )}
      </div>

      <div style={estiloNav}>
        {usuario ? (
          <button style={estiloBoton} onClick={cerrarSesion}>
            Cerrar sesión
          </button>
        ) : (
          <Link to="/login" style={estiloLink}>
            Login
          </Link>
        )}
      </div>
    </header>
  );
}

export default Encabezado;