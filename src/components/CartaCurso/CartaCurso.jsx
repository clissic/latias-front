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
  // Función para obtener el símbolo de moneda según el código
  const getCurrencySymbol = (currencyCode) => {
    const currencySymbols = {
      'USD': '$',
      'UYU': '$U',
      'EUR': '€',
      'ARS': '$',
      'BRL': 'R$',
      'MXN': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'PYG': '₲'
    };
    return currencySymbols[currencyCode?.toUpperCase()] || '$';
  };

  // Obtener la moneda del curso o usar USD por defecto
  const courseCurrency = currency || 'USD';
  const currencySymbol = getCurrencySymbol(courseCurrency);
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
            <h2 className="d-flex justify-content-center align-items-center gap-2 price-unified">
              <span className="text-money">{currencySymbol}</span> 
              <span className="price-number">{price}<span className="money-decimal">.00</span></span>
              <span className="text-money">{courseCurrency}</span>
            </h2>
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
