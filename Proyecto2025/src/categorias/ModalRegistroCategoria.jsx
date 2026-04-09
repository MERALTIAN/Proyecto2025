import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const ModalRegistroCategoria = ({ mostrarModal, setMostrarModal, nuevaCategoria, handleChange, agregarCategoria }) => {
    const [deshabilitado, setDeshabilitado] = useState(false);

    const handleRegistrar = async () => {
        setDeshabilitado(true);
        await agregarCategoria();
        setDeshabilitado(false);
    };

    return (
        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered>
            <Modal.Header closeButton>
                <Modal.Title>Agregar Categoría</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre de la Categoría</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="nombre_categoria" 
                            value={nuevaCategoria.nombre_categoria} 
                            onChange={handleChange} 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={3} 
                            name="descripcion_categoria" 
                            value={nuevaCategoria.descripcion_categoria} 
                            onChange={handleChange} 
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
                <Button variant="primary" onClick={handleRegistrar} disabled={deshabilitado}>Guardar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalRegistroCategoria;