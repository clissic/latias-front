import './LogInForm.css';
import React, { useState } from "react";
import { Link } from "react-router-dom";

export function LogInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Aca se va a manejar el envío del formulario, como enviar los datos al servidor
    console.log("Email:", email, "Password:", password);
  };

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
                <input
                    type="password"
                    id="password"
                    className="form-control"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    required
                />
            </div>
            <button onClick={handleSubmit} type="submit" className="btn btn-primary">
                INGRESAR
            </button>
        </form>
        <div>
            <Link to="/signup" className="signUn"><p>Crear cuenta nueva</p></Link>
            <Link to="/recuperarPass" className="signUn"><p>Olvidé mi contraseña</p></Link>
        </div>
    </div>
  );
}