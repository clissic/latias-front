import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function CrearUsuario() {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    ci: "",
    password: "",
    confirmPassword: "",
    birth: "",
    phone: "",
    category: "Cadete"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.ci || !userData.birth || !userData.password) {
      return "Los campos firstName, lastName, email, ci, birth y password son requeridos";
    }

    if (userData.password !== userData.confirmPassword) {
      return "Las contraseñas no coinciden";
    }

    if (userData.password.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: validationError,
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = userData;
      const response = await apiService.createUser(dataToSend);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Usuario creado",
          text: response.msg || "El usuario se ha creado exitosamente",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });

        // Resetear formulario
        setUserData({
          firstName: "",
          lastName: "",
          email: "",
          ci: "",
          password: "",
          confirmPassword: "",
          birth: "",
          phone: "",
          category: "Cadete"
        });
      } else {
        throw new Error(response.msg || "Error al crear el usuario");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al crear el usuario",
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
    <Form onSubmit={handleSubmit} className="crear-curso-form">
      <div className="form-section">
        <h5 className="text-orange mb-3">Datos básicos del usuario:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={userData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Apellido *</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={userData.lastName}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>CI *</Form.Label>
            <Form.Control
              type="text"
              name="ci"
              value={userData.ci}
              onChange={handleChange}
              required
            />
            <Form.Text className="text-muted">
              Sin puntos ni guiones
            </Form.Text>
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Fecha de nacimiento *</Form.Label>
            <Form.Control
              type="date"
              name="birth"
              value={userData.birth}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={userData.phone}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Categoría *</Form.Label>
            <Form.Select
              name="category"
              value={userData.category}
              onChange={handleChange}
              required
            >
              <option value="Cadete">Cadete</option>
              <option value="Instructor">Instructor</option>
              <option value="Administrador">Administrador</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Contraseña *</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              minLength={6}
              required
            />
            <Form.Text className="text-muted">
              Mínimo 6 caracteres
            </Form.Text>
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Confirmar contraseña *</Form.Label>
            <Form.Control
              type="password"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section mt-4">
        <div className="div-border-color my-3"></div>
        <div className="d-flex justify-content-end">
          <Button variant="warning" type="submit" size="lg" className="px-5">
            <i className="bi bi-check-circle me-2"></i> CREAR USUARIO
          </Button>
        </div>
      </div>
    </Form>
  );
}
