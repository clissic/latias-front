import "../../App.css"
import "../LogInForm/LogInForm.css";
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { FadeIn } from "../FadeIn/FadeIn.jsx";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isTokenValid, setIsTokenValid] = useState(null);

  useEffect(() => {
    async function checkToken() {
      try {
        const response = await fetch(`/api/tokens/recoverPassword?token=${token}&email=${email}`);
        const data = await response.json();
        if (data.success) {
          setIsTokenValid(true);
        } else {
          setIsTokenValid(false);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: data.message,
            confirmButtonText: "Cerrar",
            customClass: {
              popup: "custom-alert"
            }
          }).then(() => navigate("/"));
        }
      } catch (error) {
        setIsTokenValid(false);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error verificando el token.",
          confirmButtonText: "Cerrar",
        }).then(() => navigate("/"));
      }
    }

    if (token && email) {
      checkToken();
    } else {
      navigate("/");
    }
  }, [token, email, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/tokens/recoverForm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, newPassword, confirmPassword }),
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
        setTimeout(() => {
          navigate("/login");
        }, 5000);
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

  if (isTokenValid === null) {
    return <p className="text-white">Verificando token...</p>;
  }

  if (!isTokenValid) {
    return null;
  }

  return (
    <FadeIn>
      <div className="login-form-container">
        <i className="bi bi-key-fill display-1 text-orange text-center"></i>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="newPassword">Nueva Contraseña</label>
            <input
              type="password"
              id="newPassword"
              className="form-control"
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu nueva contraseña"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">
            ACTUALIZAR CONTRASEÑA
          </button>
        </form>
      </div>
    </FadeIn>
  );
}
