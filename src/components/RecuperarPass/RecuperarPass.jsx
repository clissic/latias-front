import "../LogInForm/LogInForm.css";
import "../../App.css";
import Swal from "sweetalert2";
import React, { useState } from "react";
import { FadeIn } from "../FadeIn/FadeIn.jsx";
import { useNavigate } from "react-router-dom";

export function RecuperarPass() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      // Verificar si el usuario existe
      const userResponse = await fetch(`/api/users/findByEmail?email=${email}`);
      const userData = await userResponse.json();
      
      if (userData.status === "error") {
        return Swal.fire({
          icon: "error",
          title: "Error",
          text: "No hay ningún usuario registrado con ese email.",
          confirmButtonText: "Cerrar",
          customClass: {
            popup: "custom-alert"
          }
        });
      }

      // Si el usuario existe, proceder con la recuperación
      const response = await fetch("/api/tokens/recoverPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      Swal.fire({
        icon: data.success ? "success" : "error",
        title: data.success ? "Éxito" : "Error",
        text: data.message,
        confirmButtonText: "Cerrar",
        showConfirmButton: !data.success,
        timer: data.success ? 5000 : null,
        customClass: {
          popup: "custom-alert"
        }
      });

      if (data.success) {
        setTimeout(() => navigate("/login"), 5000);
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error inesperado. Inténtalo nuevamente.",
        confirmButtonText: "Cerrar",
        customClass: {
          popup: "custom-alert"
        }
      });
    }
  }

  return (
    <FadeIn>
      <div className="login-form-container">
        <i className="bi bi-envelope-at-fill display-1 text-orange text-center"></i>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              className="form-control"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingresa tu correo"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            RECUPERAR CONTRASEÑA
          </button>
        </form>
        <div className="text-white">
          <p>
            Recibirás un enlace para restablecer tu contraseña si el correo está
            registrado.
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
