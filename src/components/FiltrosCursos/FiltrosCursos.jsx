import React, { useEffect, useState } from "react";
import { FadeIn } from "../FadeIn/FadeIn";
import "./FiltrosCursos.css";

export const FiltrosCursos = ({
  setFiltros,
  aplicarFiltros,
  limpiarFiltros,
  categories,
  durations,
  difficulties,
  maxPrice = 1000,
}) => {
  const [precios, setPrecios] = useState({ min: 0, max: maxPrice });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      [name]: value,
    }));
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    const newPrecios = {
      ...precios,
      [name]: numValue,
    };
    
    // Asegurar que min no sea mayor que max y viceversa
    if (name === "min" && numValue > precios.max) {
      newPrecios.max = numValue;
    } else if (name === "max" && numValue < precios.min) {
      newPrecios.min = numValue;
    }
    
    setPrecios(newPrecios);
    
    // Actualizar filtros inmediatamente
    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      precioMin: newPrecios.min,
      precioMax: newPrecios.max,
    }));
  };

  // Sincronizar precios con filtros cuando cambian
  useEffect(() => {
    setFiltros((prevFiltros) => ({
      ...prevFiltros,
      precioMin: precios.min,
      precioMax: precios.max,
    }));
  }, [precios, setFiltros]);
  
  // Actualizar precios cuando cambia maxPrice
  useEffect(() => {
    if (maxPrice && precios.max > maxPrice) {
      setPrecios(prev => ({ ...prev, max: maxPrice }));
    }
  }, [maxPrice]);

  return (
    <div className="filtro-column col-12 col-lg-3">
      <FadeIn>
        <aside>
          <h2 className="mb-4">Filtros</h2>
          <div className="mb-3">
            <label className="text-orange" htmlFor="keywords">
              Palabras clave:
            </label>
            <input
              type="text"
              name="keywords"
              id="keywords"
              className="form-control"
              onChange={handleFilterChange}
            />
          </div>
          <div className="mb-3">
            <label className="text-orange" htmlFor="categoria">
              Categoría:
            </label>
            <select
              name="categoria"
              id="categoria"
              className="form-select"
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="text-orange" htmlFor="dificultad">
              Dificultad:
            </label>
            <select
              name="dificultad"
              id="dificultad"
              className="form-select"
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              {difficulties.map((difficulty, index) => (
                <option key={index} value={difficulty}>
                  {difficulty}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="text-orange" htmlFor="dificultad">
              Duración:
            </label>
            <select
              name="duracion"
              id="duracion"
              className="form-select"
              onChange={handleFilterChange}
            >
              <option value="">Todas</option>
              {durations.map((duration, index) => (
                <option key={index} value={duration}>
                  {duration}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="text-orange mb-2 d-block">Precio:</label>
            <div className="d-flex gap-2 align-items-center mb-2">
              <div className="flex-grow-1">
                <label htmlFor="precioMin" className="text-white-50 small">Mínimo:</label>
                <input
                  type="number"
                  name="min"
                  id="precioMin"
                  min="0"
                  max={maxPrice}
                  step="0.01"
                  value={precios.min}
                  className="form-control form-control-sm"
                  onChange={handlePriceChange}
                />
              </div>
              <div className="flex-grow-1">
                <label htmlFor="precioMax" className="text-white-50 small">Máximo:</label>
                <input
                  type="number"
                  name="max"
                  id="precioMax"
                  min="0"
                  max={maxPrice}
                  step="0.01"
                  value={precios.max}
                  className="form-control form-control-sm"
                  onChange={handlePriceChange}
                />
              </div>
            </div>
            <div className="d-flex gap-2 mb-2">
              <input
                type="range"
                name="min"
                min="0"
                max={maxPrice}
                step="1"
                value={precios.min}
                className="form-range flex-grow-1"
                onChange={handlePriceChange}
              />
              <input
                type="range"
                name="max"
                min="0"
                max={maxPrice}
                step="1"
                value={precios.max}
                className="form-range flex-grow-1"
                onChange={handlePriceChange}
              />
            </div>
            <span className="text-white-50 small">{`Rango: U$D ${precios.min} - U$D ${precios.max}`}</span>
          </div>
          <div className="mb-3 d-grid gap-3">
            <button className="btn btn-warning w-100" onClick={aplicarFiltros}>
              <strong>APLICAR</strong>
            </button>
            <button
              className="btn btn-secondary w-100"
              onClick={() => {
                setPrecios({ min: 0, max: maxPrice });
                limpiarFiltros();
              }}
            >
              LIMPIAR FILTROS
            </button>
          </div>
        </aside>
      </FadeIn>
    </div>
  );
};
