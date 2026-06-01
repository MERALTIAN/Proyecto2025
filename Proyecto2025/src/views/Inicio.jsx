import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import ChatIA from "../components/ChatIA";

const Inicio = () => {
  const [mostrarChat, setMostrarChat] = useState(false);

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-4">
        <Col>
          <h2><i className="bi-house-fill me-2"></i> Inicio</h2>
          <p className="text-muted">Bienvenido al panel principal. Usa el asistente inteligente para consultar datos de ventas, clientes y productos.</p>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => setMostrarChat(true)}>
            <i className="bi bi-chat-dots-fill me-2"></i>Consultas Inteligentes
          </Button>
        </Col>
      </Row>

      <ChatIA mostrar={mostrarChat} onCerrar={() => setMostrarChat(false)} />
    </Container>
  );
};

export default Inicio;