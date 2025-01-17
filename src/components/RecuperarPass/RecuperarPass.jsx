import '../LogInForm/LogInForm.css';
import React, { useState } from "react";

export function RecuperarPass() {
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // Aca se va a enviar el email al servidor para la recuperación de contraseña
    console.log("Email enviado para recuperación:", email);
  };

  return (
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
        <div className='text-white'>
            <p>Recibirás un enlace para restablecer tu contraseña si el correo está registrado.</p>
        </div>
    </div>
  );
}