import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CartaCurso.css";

export function CartaCurso({
  id,
  name,
  currency,
  price,
  category,
  image,
  shortDescription,
  duration,
  difficulty,
}) {
  return (
    <div className="card h-100 cartaCurso">
      <div className="overflow-hidden">
        <img src={image} className="card-img-top" alt={name} />
      </div>
      <div className="card-body d-flex flex-column justify-content-between">
        <div className="card-text mb-2">
            <span className="badge text-bg-dark">{category}</span>
        </div>
        <h5 className="card-title">{name}</h5>
        <p>{shortDescription}</p>
        <div className="d-flex justify-content-between">
          <p className="card-text text-center">
            Duración: <strong>{duration}</strong>
          </p>
          <p className="card-text text-center">
            Dificultad: <strong>{difficulty}</strong>
          </p>
        </div>
        <div className="card-text mb-2">
          <h2 className="d-flex justify-content-center align-items-center gap-2"><span className="text-money">{currency}</span> <strong>{price}</strong></h2>
        </div>
        <div>
          <Link to={`/course/${id}`} className="btn btn-warning w-100">
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}
