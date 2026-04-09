import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { supabase } from '../database/supabaseconfig';

import ModalRegistroCategoria from '../categorias/ModalRegistroCategoria';
import NotificacionOperacion from '../components/NotificacionOperacion';

const Categorias = () => {
    // Estados para la notificación (Toast)
    const [mostrarToast, setMostrarToast] = useState(false);
    const [mensajeToast, setMensajeToast] = useState('');
    const [tipoToast, setTipoToast] = useState('exito');

    // Estados para el Modal y el Formulario
    const [mostrarModal, setMostrarModal] = useState(false);
    const [nuevaCategoria, setNuevaCategoria] = useState({ 
        nombre_categoria: '', 
        descripcion_categoria: '' 
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNuevaCategoria({ ...nuevaCategoria, [name]: value });
    };

    const agregarCategoria = async () => {
        // Validación de campos vacíos
        if (!nuevaCategoria.nombre_categoria || !nuevaCategoria.descripcion_categoria) {
            setMensajeToast('Por favor, complete todos los campos.');
            setTipoToast('advertencia');
            setMostrarToast(true);
            return;
        }

        // Inserción en Supabase
        const { error } = await supabase.from('categorias').insert([nuevaCategoria]);

        if (error) {
            setMensajeToast('Error al registrar la categoría.');
            setTipoToast('error');
        } else {
            setMensajeToast('Categoría registrada con éxito.');
            setTipoToast('exito');
            setMostrarModal(false);
            setNuevaCategoria({ nombre_categoria: '', descripcion_categoria: '' });
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
        </div>
    );
};

export default Categorias;