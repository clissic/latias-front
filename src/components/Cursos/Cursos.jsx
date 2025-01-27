import React, { useEffect, useState } from "react";
import { CartaCurso } from "../CartaCurso/CartaCurso";
import { FiltrosCursos } from "../FiltrosCursos/FiltrosCursos";

export function Cursos() {
  const [allCourses, setAllCourses] = useState([]); // Cursos originales
  const [courses, setCourses] = useState([]); // Cursos filtrados
  const [filtros, setFiltros] = useState({
    keywords: "",
    categoria: "",
    dificultad: "",
    duracion: "",
    precioMin: 0,
    precioMax: 1000,
  });

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/cursos.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setAllCourses(data);
        setCourses(data);
      })
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

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

  return (
    <div className="container mt-4">
      <h6 className="text-warning">INSCRIBITE AHORA</h6>
      <h1 className="text-white mb-5">Explorá todos nuestros cursos:</h1>
      <div className="row">
          <FiltrosCursos
            setFiltros={setFiltros}
            aplicarFiltros={aplicarFiltros}
            limpiarFiltros={limpiarFiltros}
            categories={[...new Set(allCourses.map((c) => c.category))]}
            difficulties={[...new Set(allCourses.map((c) => c.difficulty))]}
            durations={[...new Set(allCourses.map((c) => c.duration))]}
          />
        <section className="col-12 col-md-10">
          <div className="row g-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="col-12 col-sm-6 col-md-4 col-lg-3"
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

