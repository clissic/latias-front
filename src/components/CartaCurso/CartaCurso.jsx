import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./CartaCurso.css";
import { FadeIn } from "../FadeIn/FadeIn";

export function CartaCurso({
  courseId,
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
    <FadeIn>
      <div className="card h-100 cartaCurso">
        <div className="overflow-hidden">
          <img src={image} className="card-img-top" alt={name} />
        </div>
        <div className="card-body d-flex flex-column justify-content-between">
          <div className="card-text mb-2">
              <span className= {`badge ${category}-bg`}>{category}</span>
          </div>
          <h5 className="card-title">{name}</h5>
          <hr />
          <p>{shortDescription}</p>
          <div className="d-flex justify-content-between">
            <p className="card-text text-center">
              Duración: <strong>{duration} horas</strong>
            </p>
            <p className="card-text text-center">
              Dificultad: <strong>{difficulty}</strong>
            </p>
          </div>
          <hr />
          <div className="card-text">
            <h2 className="d-flex justify-content-center align-items-center gap-2"><span className="text-money">{currency}</span> <strong>{price}<span className="money-decimal">.00</span></strong></h2>
          </div>
          <hr />
          <div className="d-flex f-row gap-3">
            <Link to={`/course/${courseId}`} className="btn btn-warning w-50">
              Ver detalles
            </Link>
            <Link to={`/course/buy/${courseId}`} className="btn btn-success w-50">
              Enrolarte ahora
            </Link>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
