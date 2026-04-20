import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner } from 'react-bootstrap';
import { supabase } from '../database/supabaseconfig';

// Importación de componentes hijos
import ModalRegistroCategoria from '../categorias/ModalRegistroCategoria';
import NotificacionOperacion from '../components/NotificacionOperacion';
import TablaCategorias from '../categorias/TablaCategorias';
import TarjetaCategoria from '../categorias/TarjetaCategoria';
// Nuevas importaciones según la guía
import ModalEdicionCategoria from '../categorias/ModalEdicionCategoria';
import ModalEliminacionCategoria from '../categorias/ModalEliminacionCategoria';

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

    // Estados para edición y eliminación
    const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
    const [categoriaAEliminar, setCategoriaAEliminar] = useState(null);
    const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
    const [categoriaEditar, setCategoriaEditar] = useState({
        id_Categoria: "",
        nombre_categoria: "",
        descripcion_categoria: "",
    });

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

    // --- MÉTODO PARA CARGAR DATOS ---
    const cargarCategorias = async () => {
        try {
            setCargando(true);
            const { data, error } = await supabase
                .from("categorias")
                .select("*")
                .order("id_Categoria", { ascending: true });

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

    // --- MANEJO DE INPUTS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria({ ...nuevaCategoria, [name]: value });
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --- OPERACIONES CRUD (INSERT, UPDATE, DELETE) ---
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
            await cargarCategorias();
        }
        setMostrarToast(true);
    };

    const actualizarCategoria = async () => {
        try {
            if (!categoriaEditar.nombre_categoria.trim() || !categoriaEditar.descripcion_categoria.trim()) {
                setMensajeToast("Debe llenar todos los campos.");
                setTipoToast("advertencia");
                setMostrarToast(true);
                return;
            }

            setMostrarModalEdicion(false);

            const { error } = await supabase
                .from("categorias")
                .update({
                    nombre_categoria: categoriaEditar.nombre_categoria,
                    descripcion_categoria: categoriaEditar.descripcion_categoria,
                })
                .eq("id_Categoria", categoriaEditar.id_Categoria);

            if (error) {
                setMensajeToast(`Error al actualizar la categoría.`);
                setTipoToast("error");
            } else {
                setMensajeToast(`Categoría actualizada exitosamente.`);
                setTipoToast("exito");
                await cargarCategorias();
            }
            setMostrarToast(true);
        } catch (err) {
            console.error("Error:", err.message);
        }
    };

    const eliminarCategoria = async () => {
        if (!categoriaAEliminar) return;
        try {
            setMostrarModalEliminacion(false);

            const { error } = await supabase
                .from("categorias")
                .delete()
                .eq("id_Categoria", categoriaAEliminar.id_Categoria);

            if (error) {
                setMensajeToast(`Error al eliminar la categoría.`);
                setTipoToast("error");
            } else {
                setMensajeToast(`Categoría eliminada exitosamente.`);
                setTipoToast("exito");
                await cargarCategorias();
            }
            setMostrarToast(true);
        } catch (err) {
            console.error("Error:", err.message);
        }
    };

    return (
        <div className="container category-page mt-5">
            <div className="category-header-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                    <div>
                        <span className="badge bg-primary bg-opacity-10 text-primary mb-2">
                            <i className="bi bi-tags-fill me-2"></i>Categorías
                        </span>
                        <h2 className="mb-1 category-page-title">Gestión de Categorías</h2>
                        <p className="text-muted mb-1">
                            Administra las categorías de tu catálogo con una vista clara y cómoda.
                        </p>
                        <small className="text-secondary">
                            {categorias.length} {categorias.length === 1 ? 'categoría' : 'categorías'} disponibles
                        </small>
                    </div>
                    <button
                        className="btn btn-primary px-4 py-2"
                        onClick={() => setMostrarModal(true)}
                    >
                        <i className="bi bi-plus-circle me-2"></i>Nueva Categoría
                    </button>
                </div>
            </div>

            {/* Spinner mientras carga */}
            {cargando && (
                <Row className="text-center my-5">
                    <Col>
                        <Spinner animation="border" variant="primary" size="lg" />
                        <p className="mt-3 text-muted">Cargando categorías...</p>
                    </Col>
                </Row>
            )}

            {!cargando && categorias.length > 0 && (
                <Row>
                    <Col xs={12} className="d-none d-lg-block">
                        <div className="category-table-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
                            <TablaCategorias
                                categorias={categorias}
                                abrirModalEdicion={abrirModalEdicion}
                                abrirModalEliminacion={abrirModalEliminacion}
                            />
                        </div>
                    </Col>

                    <Col xs={12} className="d-block d-lg-none">
                        <div className="category-table-card mb-4 p-0">
                            <TarjetaCategoria
                                categorias={categorias}
                                abrirModalEdicion={abrirModalEdicion}
                                abrirModalEliminacion={abrirModalEliminacion}
                            />
                        </div>
                    </Col>
                </Row>
            )}

            {!cargando && categorias.length === 0 && (
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center py-5">
                        <div className="bg-light rounded-4 p-4">
                            <h5 className="mb-3">No hay categorías registradas</h5>
                            <p className="text-muted mb-0">
                                Agrega una nueva categoría para comenzar a visualizarla aquí.
                            </p>
                        </div>
                    </Col>
                </Row>
            )}

            {/* Componentes de Notificación y Registro */}
            <NotificacionOperacion
                visible={mostrarToast}
                setVisible={setMostrarToast}
                mensaje={mensajeToast}
                tipo={tipoToast}
                onCerrar={() => setMostrarToast(false)}
            />

            <ModalRegistroCategoria
                mostrarModal={mostrarModal}
                setMostrarModal={setMostrarModal}
                nuevaCategoria={nuevaCategoria}
                handleChange={handleChange}
                agregarCategoria={agregarCategoria}
            />

            {/* --- IMPLEMENTACIÓN DE MODALES DE EDICIÓN Y ELIMINACIÓN --- */}
            <ModalEdicionCategoria
                mostrarModalEdicion={mostrarModalEdicion}
                setMostrarModalEdicion={setMostrarModalEdicion}
                categoriaEditar={categoriaEditar}
                manejoCambioInputEdicion={manejoCambioInputEdicion}
                actualizarCategoria={actualizarCategoria}
            />

            <ModalEliminacionCategoria
                mostrarModalEliminacion={mostrarModalEliminacion}
                setMostrarModalEliminacion={setMostrarModalEliminacion}
                eliminarCategoria={eliminarCategoria}
                categoria={categoriaAEliminar}
            />
        </div>
    );
};

export default Categorias;