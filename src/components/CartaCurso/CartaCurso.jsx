import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./CartaCurso.css";
import { FadeIn } from "../FadeIn/FadeIn";

const CURRENCY_SYMBOLS = { USD: "$", UYU: "$U", EUR: "€", ARS: "$" };

function getDifficultyBadgeClass(difficulty) {
  const d = (difficulty || "").toLowerCase();
  if (d.includes("principiante")) return "cartaCurso-difficulty-Princiante";
  if (d.includes("intermedio")) return "cartaCurso-difficulty-Intermedio";
  if (d.includes("avanzado")) return "cartaCurso-difficulty-Avanzado";
  return "cartaCurso-difficulty-Intermedio";
}

export function CartaCurso({
  courseId,
  name,
  category,
  image,
  shortDescription,
  price,
  currency = "USD",
  difficulty,
  isPurchased = false,
}) {
  const navigate = useNavigate();
  const currencySymbol = CURRENCY_SYMBOLS[currency?.toUpperCase()] || currency || "$";
  const hasPrice = price != null && price !== "" && !Number.isNaN(Number(price));
  const difficultyLabel = difficulty || "Intermedio";

  const handleCardClick = () => {
    navigate(`/course/${courseId}`);
  };

  return (
    <FadeIn>
      <div
        className="card w-100 h-100 cartaCurso"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`Ver detalles de ${name}`}
      >
        <div
          className="cartaCurso-image-wrap"
          style={{ backgroundImage: image ? `url(${image})` : undefined }}
          role="img"
          aria-label={name}
        >
          <span className={`badge cartaCurso-badge ${(category || "").replace(/\s+/g, "-")}-bg`}>
            {category || "Curso"}
          </span>
        </div>
        <div className="card-body d-flex flex-column">
          <h5 className="cartaCurso-title">{name}</h5>
          <p className="cartaCurso-desc mb-0">{shortDescription}</p>
          <div className="cartaCurso-price-row mb-2">
            <p className="cartaCurso-price text-white-50 mb-0">
              {hasPrice ? (
                <>
                  <span className="me-1">Precio:</span>
                  <span className="cartaCurso-price-symbol me-1">{currencySymbol}</span>
                  <span className="cartaCurso-price-value">{Number(price)}</span>
                </>
              ) : (
                <span className="text-white-50">&nbsp;</span>
              )}
            </p>
            <span className={`badge cartaCurso-difficulty-badge ${getDifficultyBadgeClass(difficulty)}`}>
              {difficultyLabel}
            </span>
          </div>
          <div className="cartaCurso-actions mt-2" onClick={(e) => e.stopPropagation()}>
            {isPurchased ? (
              <Link to="/dashboard/cursos" className="btn btn-warning w-100 p-2">
                En tu bitácora
              </Link>
            ) : (
              <Link to={`/course/buy/${courseId}`} className="btn btn-success w-100 p-2">
                Enrolarte ahora
              </Link>
            )}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
