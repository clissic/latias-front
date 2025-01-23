import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CartaCurso.css";

export function CartaCurso({
  id,
  name,
  price,
  category,
  image,
  shortDescription,
  duration,
  difficulty,
}) {
  return (
    <div className="card h-100 cartaCurso">
      <div className="h-50 overflow-hidden">
        <img src={image} className="card-img-top" alt={name} />
      </div>
      <div className="card-body">
        <div className="card-text mb-2">
            <span className="badge text-bg-dark">{category}</span>
        </div>
        <h5 className="card-title">{name}</h5>
        <div className="card-text gap-3 d-flex justify-content-center align-items-center">
          <h2>${price}</h2>
        </div>
        <p>{shortDescription}</p>
        <div className="d-flex justify-content-between">
          <p className="card-text text-center">
            <strong>Duración:</strong> {duration}
          </p>
          <p className="card-text text-center">
            <strong>Dificultad:</strong> {difficulty}
          </p>
        </div>
        <div className="d-flex justify-content-end">
          <Link to={`/course/${id}`} className="btn btn-warning">
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
}
