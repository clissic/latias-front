import React from "react";
import { useNavigate } from "react-router-dom";
import { GestionarMisCursos } from "./GestionarMisCursos";
import "./Camarote.css";

export function Camarote({ user }) {
  const navigate = useNavigate();

  if (!user) return null;

  const handleBack = () => {
    navigate("/dashboard");
  };

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Camarote:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      <div className="col-12 w-100">
        <div className="camarote-section camarote-section-active">
          <GestionarMisCursos user={user} onBack={handleBack} />
        </div>
      </div>
    </div>
  );
}
