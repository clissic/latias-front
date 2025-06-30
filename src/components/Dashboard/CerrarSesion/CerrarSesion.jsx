import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import './CerrarSesion.css';

export function CerrarSesion() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/sessions/logout", {
        method: "POST",
        credentials: "include", // importante para enviar cookies
      });

      logout(); // limpiás el contexto del frontend
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="text-center mt-5">
      <i className="text-orange bi bi-door-open-fill display-1"></i>
      <div className="text-white my-5">
        <h2>Puedes cerrar sesión aquí.</h2>
        <p>¿Seguro/a que deseas abandonar el buque?</p>
      </div>

      <Button variant="danger" onClick={() => setShowModal(true)}>
        CERRAR SESIÓN
      </Button>

      {/* Modal de Confirmación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar cierre de sesión</Modal.Title>
        </Modal.Header>
        <Modal.Body>Navegante, estas a punto de saltar por la borda...</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Sí, cerrar sesión
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
