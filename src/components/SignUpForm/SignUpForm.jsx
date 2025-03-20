import './SignUpForm.css';
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birth, setBirth] = useState("");
  const [ci, setCi] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

function handleSubmit(e) {
  e.preventDefault();

  // Validación de contraseñas
  if (password !== confirmPassword) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Las contraseñas no coinciden.",
      confirmButtonText: "Aceptar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
      },
    });
    return;
  }

  // Validación de términos y condiciones
  if (!termsAccepted) {
    Swal.fire({
      icon: "warning",
      title: "Atención",
      text: "Debes aceptar los términos y condiciones.",
      confirmButtonText: "Aceptar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
      },
    });
    return;
  }

  // Datos del usuario que se enviarán
  const userData = {
    firstName,
    lastName,
    birth,
    ci,
    email,
    password
  };

  // Enviar los datos al servidor
  fetch("/api/sessions/signup", {
    method: "POST", // Método POST
    headers: {
      "Content-Type": "application/json", // Especificamos el tipo de contenido
    },
    body: JSON.stringify(userData), // Convertimos el objeto de datos a una cadena JSON
  })
    .then((response) => response.json()) // Parseamos la respuesta JSON
    .then((data) => {
      // Aquí manejas la respuesta del servidor
      if (data.message === "Registro exitoso") {
        Swal.fire({
          icon: "success",
          title: "Usuario creado",
          text: "El usuario se creó con éxito.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        }).then(() => {
          // Redirigir a /login después de mostrar el mensaje
          window.location.href = "/login";
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Hubo un problema al crear el usuario.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    })
    .catch((error) => {
      // Manejo de errores
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al enviar la solicitud.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      console.error("Error en la solicitud:", error);
    });
}


  return (
    <div className="signup-form-container">
        <i className="bi bi-person-fill-add display-1 text-orange text-center"></i>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="firstName">Nombre</label>
          <input
            type="text"
            id="firstName"
            className="form-control"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Ingresa tu nombre"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="lastName">Apellido</label>
          <input
            type="text"
            id="lastName"
            className="form-control"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Ingresa tu apellido"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="ci">C.I.</label>
          <input
            type="text"
            id="ci"
            className="form-control"
            value={ci}
            onChange={(e) => setCi(e.target.value)}
            placeholder="Ingresa tu documento de identidad"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="birth">Fecha de Nacimiento</label>
          <input
            type="date"
            id="birth"
            className="form-control"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresa tu correo"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresa tu contraseña"
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">Confirmar Contraseña</label>
          <input
            type="password"
            id="confirmPassword"
            className="form-control"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repite tu contraseña"
            required
          />
        </div>
        <div className="input-group checkbox-group">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            /* required */
          />
          <label htmlFor="terms">
            He leído y estoy de acuerdo con los <Link to="/terminosycondiciones">Términos y Condiciones</Link>.
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          REGISTRARSE
        </button>
      </form>
    </div>
  );
}
