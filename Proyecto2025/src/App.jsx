import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./views/Inicio";
import Login from "./views/Login";
import Productos from "./views/Productos";
import Categorias from "./views/Categorias";
import Catalogo from "./views/Catalogo";
import Empleados from "./views/Empleados";
import Permisos from "./views/Permisos";
import Clientes from "./views/Clientes";
import Ventas from "./views/Ventas";
import Pagina404 from "./views/Pagina404";
import Encabezado from "./navegacion/Encabezado";
import RutaProtegida from "./rutas/RutaProtegida";

function App() {
  return (
    <Router>
      <Encabezado />
      <Routes>
        <Route
          path="/"
          element={
            <RutaProtegida>
              <Inicio />
            </RutaProtegida>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route
          path="/productos"
          element={
            <RutaProtegida>
              <Productos />
            </RutaProtegida>
          }
        />
        <Route
          path="/categorias"
          element={
            <RutaProtegida>
              <Categorias />
            </RutaProtegida>
          }
        />
        <Route
          path="/catalogo"
          element={
            <RutaProtegida>
              <Catalogo />
            </RutaProtegida>
          }
        />
        <Route
          path="/empleados"
          element={
            <RutaProtegida>
              <Empleados />
            </RutaProtegida>
          }
        />
        <Route
          path="/clientes"
          element={
            <RutaProtegida>
              <Clientes />
            </RutaProtegida>
          }
        />
        <Route
          path="/ventas"
          element={
            <RutaProtegida>
              <Ventas />
            </RutaProtegida>
          }
        />
        {/* NUEVA RUTA */}
        <Route
          path="/permisos"
          element={
            <RutaProtegida>
              <Permisos />
            </RutaProtegida>
          }
        />
        <Route path="*" element={<Pagina404 />} />
      </Routes>
    </Router>
  );
}

export default App;