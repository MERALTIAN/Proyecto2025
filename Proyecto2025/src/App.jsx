import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Inicio from "./views/Inicio";
import Login from "./views/Login";
import Productos from "./views/Productos";
import Categorias from "./views/Categorias";
import Catalogo from "./views/Catalogo";
import Pagina404 from "./views/Pagina404";
import Encabezado from "./navegacion/Encabezado";

function App() {
  return (
    <Router>
      <Encabezado />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/productos" element={<Productos />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="*" element={<Pagina404 />} />
      </Routes>
    </Router>
  );
}

export default App;