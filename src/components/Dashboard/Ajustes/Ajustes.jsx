import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import "./Ajustes.css";

export const Ajustes = ({ user }) => {
  const [userData, setUserData] = useState({ ...user });
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
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
    } else {
      alert("Las contraseñas no coinciden");
    }
  };

  const handleDeleteAccount = () => {
    if (confirmText === "eliminar") {
      console.log("Cuenta eliminada");
      setShowModal(false);
    } else {
      alert("Debes escribir 'eliminar' para confirmar");
    }
  };

  return (
    <div className="container text-white col-11">
      <h2 className="mb-3 text-orange">Ajustes:</h2>
      
      {/* Formulario de datos personales */}
      <Form className="d-flex justify-content-between flex-wrap gap-3" onSubmit={handleSubmit}>
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
            <hr />
        </Form.Group>

        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Calle</Form.Label>
            <Form.Control type="text" name="city" value={userData.address.street} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Número</Form.Label>
            <Form.Control type="text" name="number" value={userData.address.number} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control type="text" name="city" value={userData.address.city} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Estado</Form.Label>
            <Form.Control type="text" name="state" value={userData.address.state} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-4">
            <Form.Label>Código postal</Form.Label>
            <Form.Control type="text" name="zipCode" value={userData.address.zipCode} onChange={handleChange} required />
        </Form.Group>
        <Form.Group className="col-12 col-lg-3">
            <Form.Label>País</Form.Label>
            <Form.Control type="text" name="country" value={userData.address.country} onChange={handleChange} required />
        </Form.Group>

        <Form.Group className="mt-3 d-flex flex-column col-12 align-items-end">
          <Button type="submit" className="col-12 col-lg-3">Guardar</Button>
        </Form.Group>
      </Form>

      <hr />

      {/* Formulario de actualización de contraseña */}
      <Form className="d-flex justify-content-between flex-wrap gap-3" onSubmit={handlePasswordSubmit}>
        <Form.Group className="d-flex flex-column col-12 col-lg-4">
          <Form.Label>Nueva Contraseña</Form.Label>
          <Form.Control type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} required />
        </Form.Group>
        <Form.Group className="d-flex flex-column col-12 col-lg-4">
          <Form.Label>Confirmar Contraseña</Form.Label>
          <Form.Control type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} required />
        </Form.Group>
        <Form.Group className="mt-3 d-flex flex-column col-12 col-lg-3 justify-content-end">
            <Form.Label></Form.Label>
            <Button className="col-12" type="submit">Actualizar</Button>
        </Form.Group>
      </Form>

      <hr />

      {/* Botón de eliminación de cuenta */}
      <div className="d-flex flex-column col-12 danger-zone justify-content-center align-items-center">
        <Form.Label><strong>¡ ZONA DE PELIGRO !</strong></Form.Label>
        <Button variant="danger" className="mt-3 col-12 col-lg-4" onClick={() => setShowModal(true)}>Eliminar Cuenta</Button>
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
