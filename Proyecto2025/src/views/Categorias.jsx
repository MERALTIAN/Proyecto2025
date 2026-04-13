import React, { useState, useEffect } from 'react'; 
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap'; 
import { supabase } from '../database/supabaseconfig';

// Importación de componentes hijos
import ModalRegistroCategoria from '../categorias/ModalRegistroCategoria';
import NotificacionOperacion from '../components/NotificacionOperacion';
import TablaCategorias from '../categorias/TablaCategorias'; 

const Categorias = () => {
    // --- ESTADOS PARA NOTIFICACIONES (TOAST) ---
    const [mostrarToast, setMostrarToast] = useState(false);
    const [mensajeToast, setMensajeToast] = useState('');
    const [tipoToast, setTipoToast] = useState('exito');

    // --- ESTADOS PARA CARGA Y DATOS DE SUPABASE ---
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true); 

    // --- ESTADOS PARA MODALES Y FORMULARIOS ---
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState({ 
        nombre_categoria: '', 
        descripcion_categoria: '' 
    });

    // Estados para edición y eliminación [cite: 12]
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState({
        id_Categoria: "", // Ajustado a C mayúscula según tu DB
        nombre_categoria: "",
        descripcion_categoria: "",
    });

    // --- MÉTODOS DE CONTROL PARA MODALES ---
    const abrirModalEdicion = (categoria) => {
        setCategoriaEditar({
            id_Categoria: categoria.id_Categoria,
            nombre_categoria: categoria.nombre_categoria,
            descripcion_categoria: categoria.descripcion_categoria,
        });
        setMostrarModalEdicion(true);
    }; 

    const abrirModalEliminacion = (categoria) => {
        setCategoriaAEliminar(categoria);
        setMostrarModalEliminacion(true);
    }; 

    // --- MÉTODO PARA CARGAR DATOS (CORREGIDO id_Categoria) ---
    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_Categoria", { ascending: true }); // Ajustado a C mayúscula [cite: 14]
            
            if (error) {
                console.error("Error al cargar categorías:", error.message);
                return;
            }
            setCategorias(data || []);
        } catch (err) {
            console.error("Excepción al cargar categorías:", err.message);
        } finally {
            setCargando(false);
        }
    }; 

    // --- CARGA INICIAL ---
    useEffect(() => {
        cargarCategorias();
    }, []); 

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria({ ...nuevaCategoria, [name]: value });
    };

    const agregarCategoria = async () => {
        if (!nuevaCategoria.nombre_categoria || !nuevaCategoria.descripcion_categoria) {
            setMensajeToast('Por favor, complete todos los campos.');
            setTipoToast('advertencia');
            setMostrarToast(true);
            return;
        }

        const { error } = await supabase.from('categorias').insert([nuevaCategoria]);

        if (error) {
            setMensajeToast('Error al registrar la categoría.');
            setTipoToast('error');
        } else {
            setMensajeToast('Categoría registrada con éxito.');
            setTipoToast('exito');
            setMostrarModal(false);
            setNuevaCategoria({ nombre_categoria: '', descripcion_categoria: '' });
            
            // Refrescar lista automáticamente tras insertar [cite: 20, 21]
            await cargarCategorias();
        }
        setMostrarToast(true);
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Categorías</h2>
                <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
                    <i className="bi bi-plus-circle me-2"></i>Nueva Categoría
                </button>
            </div>

            <hr />

            {/* Spinner mientras carga */}
            {cargando && (
                <Row className="text-center my-5">
                    <Col>
                        <Spinner animation="border" variant="success" size="lg" />
                        <p className="mt-3 text-muted">Cargando categorías...</p>
                    </Col>
                </Row>
            )} 

            {/* Tabla de resultados */}
            {!cargando && categorias.length > 0 && (
                <Row>
                    <Col lg={12} className="d-none d-lg-block">
                        <TablaCategorias 
                            categorias={categorias} 
                            abrirModalEdicion={abrirModalEdicion} 
                            abrirModalEliminacion={abrirModalEliminacion} 
                        />
                    </Col>
                </Row>
            )} 

            <NotificacionOperacion
                visible={mostrarToast}
                setVisible={setMostrarToast}
                mensaje={mensajeToast}
                tipo={tipoToast}
                onCerrar={() => setMostrarToast(false)} // Función para cerrar el Toast
            />

            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                handleChange={handleChange}
                agregarCategoria={agregarCategoria}
            />
        </div>
    );
};

export default Categorias;