import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "./Ajustes.css";

export const Ajustes = ({ user }) => {
  const [userData, setUserData] = useState({ ...user });
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const field = name.split(".")[1];
      setUserData({
        ...userData,
        address: {
          ...userData.address,
          [field]: value,
        },
      });
    } else {
      setUserData({ ...userData, [name]: value });
    }
  };
  

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Datos guardados:", userData);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwords.newPassword === passwords.confirmPassword) {
      console.log("Contraseña actualizada:", passwords.newPassword);
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Contraseña actualizada correctamente",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Las contraseñas no coinciden",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  const handleDeleteAccount = () => {
    if (confirmText === "eliminar") {
      console.log("Cuenta eliminada");
      setShowModal(false);
      logout();
      navigate("/");
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Debes escribir 'eliminar' para confirmar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Ajustes:</h2>
        <div className="div-border-color my-4"></div>
      </div>
      {/* Formulario de datos personales */}
      <Form className="d-flex justify-content-between flex-wrap gap-3 col-12" onSubmit={handleSubmit}>
        <h4 className="col-12 text-orange">Datos personales:</h4>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Nombre</Form.Label>
          <Form.Control type="text" name="firstName" value={userData.firstName} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Apellido</Form.Label>
          <Form.Control type="text" name="lastName" value={userData.lastName} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
          <Form.Label>C.I.</Form.Label>
          <Form.Control type="number" name="ci" value={userData.ci} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={userData.email} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control type="tel" name="phone" value={userData.phone} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
          <Form.Label>Fecha de nacimiento</Form.Label>
          <Form.Control type="date" name="birth" value={userData.birth} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="col-12">
          <div className="div-border-color my-4"></div>
        </Form.Group>

        <h4 className="col-12 text-orange">Dirección:</h4>
        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Calle</Form.Label>
            <Form.Control type="text" name="address.street" value={userData.address.street} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Número</Form.Label>
            <Form.Control type="text" name="address.number" value={userData.address.number} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control type="text" name="address.city" value={userData.address.city} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Estado</Form.Label>
            <Form.Control type="text" name="address.state" value={userData.address.state} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Código postal</Form.Label>
            <Form.Control type="text" name="address.zipCode" value={userData.address.zipCode} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
            <Form.Label>País</Form.Label>
            <Form.Control type="text" name="address.country" value={userData.address.country} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="mt-3 d-flex flex-column col-12 align-items-end">
          <Button variant="warning" type="submit" className="col-12 col-lg-3">Guardar</Button>
        </Form.Group>
      </Form>

      <div className="div-border-color my-4 col-12"></div>

      {/* Formulario de actualización de contraseña */}
      <Form className="d-flex justify-content-between flex-wrap gap-3 col-12" onSubmit={handlePasswordSubmit}>
        <h4 className="col-12 text-orange">Cambiar contraseña:</h4>
        <Form.Group className="d-flex flex-column col-12 col-lg-4">
          <Form.Label>Nueva contraseña</Form.Label>
          <Form.Control type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required />
        </Form.Group>
        <Form.Group className="d-flex flex-column col-12 col-lg-4">
          <Form.Label>Confirmar contraseña</Form.Label>
          <Form.Control type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required />
        </Form.Group>
        <Form.Group className="mt-3 d-flex flex-column col-12 col-lg-3 justify-content-end">
            <Form.Label></Form.Label>
            <Button variant="warning" className="col-12" type="submit">Actualizar</Button>
        </Form.Group>
      </Form>

      <div className="div-border-color my-4"></div>

      {/* Botón de eliminación de cuenta */}
      <div className="d-flex flex-column col-12 danger-zone justify-content-center align-items-center">
        <h4>- ZONA DE PELIGRO -</h4>
        <Button variant="danger" className="mt-3 col-12 col-lg-4" onClick={() => setShowModal(true)}>Eliminar cuenta</Button>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showModal} onHide={() => setShowModal(false)} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Escribe "eliminar" para confirmar:</p>
          <Form.Control type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleDeleteAccount}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
