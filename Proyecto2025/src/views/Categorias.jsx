import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert } from 'react-bootstrap';
import { supabase } from '../database/supabaseconfig';

// Importación de componentes hijos
import ModalRegistroCategoria from '../categorias/ModalRegistroCategoria';
import NotificacionOperacion from '../components/NotificacionOperacion';
import TablaCategorias from '../categorias/TablaCategorias';
import TarjetaCategoria from '../categorias/TarjetaCategoria';
import ModalEdicionCategoria from '../categorias/ModalEdicionCategoria';
import ModalEliminacionCategoria from '../categorias/ModalEliminacionCategoria';

// NUEVAS IMPORTACIONES
import CuadroBusquedas from '../components/ordenamiento/CuadroBusquedas';
import Paginacion from '../components/ordenamiento/Paginacion';

const Categorias = () => {
    // --- ESTADOS PARA NOTIFICACIONES (TOAST) ---
    const [mostrarToast, setMostrarToast] = useState(false);
    const [mensajeToast, setMensajeToast] = useState('');
    const [tipoToast, setTipoToast] = useState('exito');

    // --- ESTADOS PARA CARGA Y DATOS DE SUPABASE ---
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);

    // --- ESTADOS PARA BÚSQUEDA ---
    const [textoBusqueda, setTextoBusqueda] = useState('');
    const [categoriasFiltradas, setCategoriasFiltradas] = useState([]);

    // --- ESTADOS PARA PAGINACIÓN ---
    const [paginaActual, setPaginaActual] = useState(1);
    const [registrosPorPagina, setRegistrosPorPagina] = useState(5);

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

    // --- EFECTO PARA BÚSQUEDA Y CARGA INICIAL DE FILTRADAS ---
    useEffect(() => {
        if (!textoBusqueda.trim()) {
            setCategoriasFiltradas(categorias);
        } else {
            const texto = textoBusqueda.toLowerCase().trim();

            const resultado = categorias.filter((categoria) =>
                categoria.nombre_categoria.toLowerCase().includes(texto) ||
                categoria.descripcion_categoria.toLowerCase().includes(texto)
            );

            setCategoriasFiltradas(resultado);
        }

        setPaginaActual(1);
    }, [textoBusqueda, categorias]);

    // --- MANEJO DE INPUTS ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const manejoCambioInputEdicion = (e) => {
        const { name, value } = e.target;
        setCategoriaEditar((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // --- MANEJO DE BÚSQUEDA ---
    const manejarCambioBusqueda = (e) => {
        setTextoBusqueda(e.target.value);
    };

    // --- CÁLCULO DE PAGINACIÓN ---
    const indiceUltimoRegistro = paginaActual * registrosPorPagina;
    const indicePrimerRegistro = indiceUltimoRegistro - registrosPorPagina;

    const categoriasPaginadas = categoriasFiltradas.slice(
        indicePrimerRegistro,
        indiceUltimoRegistro
    );

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
                            {categoriasFiltradas.length} {categoriasFiltradas.length === 1 ? 'categoría' : 'categorías'} disponibles
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
                        <p className="mt-3 text-muted">Cargando categorías.</p>
                    </Col>
                </Row>
            )}

            {!cargando && categorias.length > 0 && (
                <>
                    {/* CUADRO DE BÚSQUEDA */}
                    <Row className="mb-4">
                        <Col md={6} lg={5}>
                            <CuadroBusquedas
                                textoBusqueda={textoBusqueda}
                                manejarCambioBusqueda={manejarCambioBusqueda}
                            />
                        </Col>
                    </Row>

                    {/* ALERTA SI NO HAY RESULTADOS */}
                    {textoBusqueda.trim() && categoriasFiltradas.length === 0 && (
                        <Row className="mb-4">
                            <Col>
                                <Alert variant="info" className="text-center">
                                    No se encontraron categorías que coincidan con "{textoBusqueda}".
                                </Alert>
                            </Col>
                        </Row>
                    )}

                    {/* TABLA / TARJETAS */}
                    {categoriasFiltradas.length > 0 && (
                        <Row>
                            <Col xs={12} className="d-none d-lg-block">
                                <div className="category-table-card mb-4 p-4 shadow-sm rounded-4 bg-white border">
                                    <TablaCategorias
                                        categorias={categoriasPaginadas}
                                        abrirModalEdicion={abrirModalEdicion}
                                        abrirModalEliminacion={abrirModalEliminacion}
                                    />
                                </div>
                            </Col>

                            <Col xs={12} className="d-block d-lg-none">
                                <div className="category-table-card mb-4 p-0">
                                    <TarjetaCategoria
                                        categorias={categoriasPaginadas}
                                        abrirModalEdicion={abrirModalEdicion}
                                        abrirModalEliminacion={abrirModalEliminacion}
                                    />
                                </div>
                            </Col>
                        </Row>
                    )}
                </>
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

            {/* PAGINACIÓN */}
            {!cargando && categoriasFiltradas.length > 0 && (
                <Paginacion
                    registrosPorPagina={registrosPorPagina}
                    totalRegistros={categoriasFiltradas.length}
                    paginaActual={paginaActual}
                    establecerPaginaActual={setPaginaActual}
                    establecerRegistrosPorPagina={setRegistrosPorPagina}
                />
            )}
        </div>
    );
};

export default Categorias;