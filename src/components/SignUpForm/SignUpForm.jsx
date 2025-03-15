import './SignUpForm.css';
import React, { useState } from "react";
import { Link } from 'react-router-dom';
import Swal from "sweetalert2";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();

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

    console.log("Usuario creado:", {
      name,
      lastName,
      birthDate,
      email,
      password,
      termsAccepted
    });
  }

  return (
    <div className="signup-form-container">
        <i className="bi bi-person-fill-add display-1 text-orange text-center"></i>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Nombre</label>
          <input
            type="text"
            id="name"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          <label htmlFor="birthDate">Fecha de Nacimiento</label>
          <input
            type="date"
            id="birthDate"
            className="form-control"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
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
