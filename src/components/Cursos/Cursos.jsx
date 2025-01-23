import React, { useState, useEffect } from "react";
import { GrillaCursos } from "../GrillaCursos/GrillaCursos";
import { FiltrosCursos } from "../FiltrosCursos/FiltrosCursos";

export function Cursos() {
  const [courses, setCourses] = useState([]);
  const [filtros, setFiltros] = useState({});({});
  const [categorys, setcategorys] = useState([]);
  const [difficultyes, setdifficultyes] = useState([]);	

  useEffect(() => {
    // Fetch de la API y actualizar el estado de courses
    fetch("https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/cursos.json")
      .then((response) => response.json())
      .then((data) => {
        setCourses(data);
        localStorage.setItem("courses", JSON.stringify(data));

        const uniqueCategories = [...new Set(data.map(course => course.category))];
        const uniqueDifficulties = [...new Set(data.map(course => course.difficulty))];

        setcategorys(uniqueCategories);
        setdifficultyes(uniqueDifficulties);
      });
  }, []);

  const aplicarFiltros = () => {
    const allCourses = JSON.parse(localStorage.getItem("courses"));
    let filteredCourses = allCourses;
    if (filtros.keywords) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.name.toLowerCase().includes(filtros.keywords.toLowerCase()) ||
          course.shortDescription
            .toLowerCase()
            .includes(filtros.keywords.toLowerCase()) ||
          course.longDescription
            .toLowerCase()
            .includes(filtros.keywords.toLowerCase()) ||
          course.category
            .toLowerCase()
            .includes(filtros.keywords.toLowerCase())
      );
    }
    if (filtros.category) {
      filteredCourses = filteredCourses.filter(
        (course) => course.category === filtros.category
      );
    }
    if (filtros.difficulty) {
      filteredCourses = filteredCourses.filter(
        (course) => course.difficulty === filtros.difficulty
      );
    }
    if (filtros.precioMin !== undefined && filtros.precioMax !== undefined) {
      filteredCourses = filteredCourses.filter(
        (course) =>
          course.price >= filtros.precioMin && course.price <= filtros.precioMax
      );
    }
    setCourses(filteredCourses);
  };

  const limpiarFiltros = () => {
    const allCourses = JSON.parse(localStorage.getItem("courses"));
    setCourses(allCourses);
    setFiltros({});
  };

  return (
    <div className="w-100">
      <h6 className="text-warning">INSCRIBITE AHORA</h6>
      <h1 className="text-white mb-5">Explorá todos nuestros cursos:</h1>
      <div className="d-flex flex-column flex-md-row gap-5">
        <FiltrosCursos
          setFiltros={setFiltros}
          aplicarFiltros={aplicarFiltros}
          limpiarFiltros={limpiarFiltros}
        />
        <GrillaCursos courses={courses} />
      </div>
    </div>
  );
}
