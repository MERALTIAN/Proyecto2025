import React from "react";
import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children }) => {
    // Verifica si hay una sesión activa en el localStorage
    const usuario = localStorage.getItem("usuario-supabase");

    if (!usuario) {
        // Si no hay usuario, redirige a la página de login
        return <Navigate to="/login" replace />;
    }

    // Si hay usuario, permite ver el contenido (Inicio, Productos, etc.)
    return children;
};

// ESTA LÍNEA ES LA QUE TE FALTA O TIENE UN ERROR:
export default RutaProtegida;