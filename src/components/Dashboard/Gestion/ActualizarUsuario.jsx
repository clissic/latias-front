import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function ActualizarUsuario({ user }) {
  const [userData, setUserData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    ci: "",
    birth: "",
    phone: "",
    category: "Cadete"
  });

  useEffect(() => {
    if (user) {
      setUserData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        ci: user.ci || "",
        birth: user.birth ? new Date(user.birth).toISOString().split('T')[0] : "",
        phone: user.phone || "",
        category: user.category || "Cadete"
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!userData.firstName || !userData.lastName || !userData.email || !userData.ci || !userData.birth) {
      return "Los campos firstName, lastName, email, ci y birth son requeridos";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user._id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el usuario a actualizar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

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
      const response = await apiService.updateUserById(user._id, userData);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Usuario actualizado",
          text: response.msg || "El usuario se ha actualizado exitosamente",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      } else {
        throw new Error(response.msg || "Error al actualizar el usuario");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al actualizar el usuario",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  if (!user) {
    return (
      <div className="text-white">
        <p>No se encontró el usuario para actualizar.</p>
      </div>
    );
  }

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
        </div>
      </div>

      <div className="form-section mt-4">
        <div className="div-border-color my-3"></div>
        <div className="d-flex justify-content-end">
          <Button variant="warning" type="submit" size="lg" className="px-5">
            <i className="bi bi-check-circle-fill me-2"></i> ACTUALIZAR USUARIO
          </Button>
        </div>
      </div>
    </Form>
  );
}
