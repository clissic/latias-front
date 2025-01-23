import React, { useEffect, useState } from "react";
import "./FiltrosCursos.css";

export const FiltrosCursos = ({ setFiltros, aplicarFiltros, limpiarFiltros }) => {
    const [precios, setPrecios] = useState({ min: 0, max: 1000 });

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prevFiltros => ({
            ...prevFiltros,
            [name]: value
        }));
    };

    const handlePriceChange = (e) => {
        const { name, value } = e.target;
        setPrecios(prevPrecios => ({
            ...prevPrecios,
            [name]: Number(value)
        }));
    };

    useEffect(() => {
        setFiltros(prevFiltros => ({
            ...prevFiltros,
            precioMin: precios.min,
            precioMax: precios.max
        }));
    }, [precios, setFiltros]);

    return (
        <aside className="filtro-column col-12 col-md-2">
            <h2 className="mb-4">Filtros</h2>
            <div className="mb-3">
                <label className="text-orange" htmlFor="keywords">Palabras clave:</label>
                <input 
                    type="text" 
                    name="keywords" 
                    id="keywords" 
                    className="form-control" 
                    onChange={handleFilterChange} 
                />
            </div>
            <div className="mb-3">
                <label className="text-orange" htmlFor="categoria">Categoría:</label>
                <select 
                    name="categoria" 
                    id="categoria" 
                    className="form-select" 
                    onChange={handleFilterChange}>
                    <option value="">Todas</option>
                    {/* Las categorías deben ser pasadas como props */}
                </select>
            </div>
            <div className="mb-3">
                <label className="text-orange" htmlFor="dificultad">Dificultad:</label>
                <select 
                    name="dificultad" 
                    id="dificultad" 
                    className="form-select" 
                    onChange={handleFilterChange}>
                    <option value="">Todas</option>
                    {/* Las dificultades deben ser pasadas como props */}
                </select>
            </div>
            <div className="mb-3">
                <label className="text-orange" htmlFor="precio">Precio:</label>
                <input
                    type="range"
                    name="min"
                    id="precio"
                    min="0"
                    max="1000"
                    value={precios.min}
                    className="form-range"
                    onChange={handlePriceChange}
                />
                <input
                    type="range"
                    name="max"
                    min="0"
                    max="1000"
                    value={precios.max}
                    className="form-range"
                    onChange={handlePriceChange}
                />
                <span>{`$${precios.min} - $${precios.max}`}</span>
            </div>
            <div className="mb-3 d-grid gap-3">
                <button 
                    className="btn btn-warning w-100" 
                    onClick={aplicarFiltros}>
                    <strong>APLICAR</strong>
                </button>
                <button 
                    className="btn btn-secondary w-100" 
                    onClick={limpiarFiltros}>
                    LIMPIAR FILTROS
                </button>
            </div>
        </aside>
    );
};