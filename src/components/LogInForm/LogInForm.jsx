import "./LogInForm.css";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiService } from "../../services/apiService";
import Swal from "sweetalert2";

export function LogInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const data = await apiService.login(email, password);

      if (data.status === "success") {
        login(data);
        const userCategory = data.payload?.user?.category;
        if (userCategory === "checkin") {
          navigate("/checkin", { replace: true });
        } else {
          Swal.fire({
            icon: "success",
            title: "Sesión iniciada",
            text: "¡Bienvenido a bordo de nuevo!",
            timer: 2000,
            showConfirmButton: false,
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          }).then(() => {
            navigate("/dashboard/general");
          });
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.msg || "Credenciales incorrectas.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Hubo un error al iniciar sesión.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      console.error("Error en la solicitud:", error);
    }
  }

  return (
    <div className="login-form-container">
      <i className="bi bi-person-circle display-1 text-orange text-center"></i>
      <form>
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
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <div className="password-input-container position-relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="form-control"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              required
            />
            <i
              className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} password-toggle-icon`}
              onClick={() => setShowPassword(!showPassword)}
            ></i>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          type="submit"
          className="btn btn-primary"
        >
          INGRESAR
        </button>
      </form>
      <div>
        <Link to="/signup" className="signUn">
          <p>Crear cuenta nueva</p>
        </Link>
        <Link to="/recuperarPass" className="signUn">
          <p>Olvidé mi contraseña</p>
        </Link>
      </div>
    </div>
  );
}
