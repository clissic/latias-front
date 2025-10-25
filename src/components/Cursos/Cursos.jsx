import React, { useEffect, useState } from "react";
import { CartaCurso } from "../CartaCurso/CartaCurso";
import { FiltrosCursos } from "../FiltrosCursos/FiltrosCursos";
import { FadeIn } from "../FadeIn/FadeIn";
import { useCourses } from "../../hooks/useApi";

export function Cursos() {
  const { courses: allCourses, loading, error } = useCourses();
  const [courses, setCourses] = useState([]);
  const [filtros, setFiltros] = useState({
    keywords: "",
    categoria: "",
    dificultad: "",
    duracion: "",
    precioMin: 0,
    precioMax: 1000,
  });

  // Actualizar cursos cuando se cargan desde la API
  useEffect(() => {
    if (allCourses.length > 0) {
      setCourses(allCourses);
    }
  }, [allCourses]);

  const aplicarFiltros = () => {
    const { keywords, categoria, dificultad, duracion, precioMin, precioMax } = filtros;

    const cursosFiltrados = allCourses.filter((course) => {
      const matchKeywords =
        keywords === "" ||
        course.name.toLowerCase().includes(keywords.toLowerCase()) ||
        course.shortDescription
          .toLowerCase()
          .includes(keywords.toLowerCase());
      const matchCategoria =
        categoria === "" || course.category === categoria;
      const matchDificultad =
        dificultad === "" || course.difficulty === dificultad;
      const matchDuration = 
        duracion === "" || course.duration === duracion;
      const matchPrecio =
        course.price >= precioMin && course.price <= precioMax;

      return matchKeywords && matchCategoria && matchDificultad && matchDuration && matchPrecio;
    });

    setCourses(cursosFiltrados);
  };

  const limpiarFiltros = () => {
    setFiltros({
      keywords: "",
      categoria: "",
      dificultad: "",
      duration: "",
      precioMin: 0,
      precioMax: 1000,
    });
    setCourses(allCourses);
  };

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-orange" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="text-white mt-3">Cargando cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mt-4 text-center">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Error al cargar cursos</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <FadeIn>
        <h6 className="text-orange">INSCRIBITE AHORA</h6>
        <h1 className="text-white mb-5">Explorá todos nuestros cursos:</h1>
      </FadeIn>
      <div className="row">
          <FiltrosCursos
            setFiltros={setFiltros}
            aplicarFiltros={aplicarFiltros}
            limpiarFiltros={limpiarFiltros}
            categories={[...new Set(allCourses.map((c) => c.category))]}
            difficulties={[...new Set(allCourses.map((c) => c.difficulty))]}
            durations={[...new Set(allCourses.map((c) => c.duration))]}
          />
        <section className="col-12 col-lg-9">
          <div className="containerCursos row g-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="col-12 col-sm-6 col-md-6 col-lg-6"
              >
                <CartaCurso
                  id={course.id}
                  name={course.name}
                  currency={course.currency}
                  price={course.price}
                  category={course.category}
                  image={course.image}
                  shortDescription={course.shortDescription}
                  duration={course.duration}
                  difficulty={course.difficulty}
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}