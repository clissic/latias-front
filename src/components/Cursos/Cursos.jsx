import React, { useEffect, useState, useRef } from "react";
import { Pagination } from "react-bootstrap";
import { CartaCurso } from "../CartaCurso/CartaCurso";
import { FiltrosCursos } from "../FiltrosCursos/FiltrosCursos";
import { FadeIn } from "../FadeIn/FadeIn";
import { useCourses } from "../../hooks/useApi";
import "../Dashboard/Gestion/Gestion.css";

export function Cursos() {
  const { courses: allCourses, loading, error } = useCourses();
  const [courses, setCourses] = useState([]);
  // Calcular precio máximo inicial
  const initialMaxPrice = allCourses.length > 0 
    ? Math.ceil(Math.max(...allCourses.map(c => Number(c.price) || 0)) * 1.1)
    : 1000;

  const [filtros, setFiltros] = useState({
    keywords: "",
    categoria: "",
    dificultad: "",
    duracion: "",
    precioMin: 0,
    precioMax: initialMaxPrice,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const coursesHeaderRef = useRef(null);

  // Calcular precio máximo de los cursos
  const maxPrice = allCourses.length > 0 
    ? Math.ceil(Math.max(...allCourses.map(c => Number(c.price) || 0)) * 1.1) // 10% más para tener margen
    : 1000;

  // Actualizar cursos cuando se cargan desde la API
  useEffect(() => {
    if (allCourses.length > 0) {
      setCourses(allCourses);
    }
  }, [allCourses]);

  // Resetear a página 1 cuando cambian los cursos filtrados
  useEffect(() => {
    setCurrentPage(1);
  }, [courses.length]);

  // Calcular paginación
  const totalPages = Math.ceil(courses.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = courses.slice(indexOfFirstItem, indexOfLastItem);

  // Generar números de página
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (coursesHeaderRef.current) {
      coursesHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const aplicarFiltros = () => {
    const { keywords, categoria, dificultad, duracion, precioMin, precioMax } = filtros;

    const cursosFiltrados = allCourses.filter((course) => {
      const matchKeywords =
        keywords === "" ||
        (course.courseName || course.name || "").toLowerCase().includes(keywords.toLowerCase()) ||
        (course.shortDescription || "")
          .toLowerCase()
          .includes(keywords.toLowerCase());
      const matchCategoria =
        categoria === "" || (course.category || "") === categoria;
      const matchDificultad =
        dificultad === "" || (course.difficulty || "") === dificultad;
      const matchDuration = 
        duracion === "" || (course.duration || "") === duracion;
      
      // Filtro de precio: convertir a número y comparar
      const coursePrice = Number(course.price) || 0;
      const minPrice = Number(precioMin) || 0;
      const maxPrice = Number(precioMax) || 1000;
      const matchPrecio = coursePrice >= minPrice && coursePrice <= maxPrice;

      return matchKeywords && matchCategoria && matchDificultad && matchDuration && matchPrecio;
    });

    setCourses(cursosFiltrados);
  };

  const limpiarFiltros = () => {
    setFiltros({
      keywords: "",
      categoria: "",
      dificultad: "",
      duracion: "",
      precioMin: 0,
      precioMax: maxPrice,
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
        <div className="text-start w-100">
          <h6 className="text-orange">INSCRIBITE AHORA</h6>
          <h1 className="text-white mb-5">Explorá todos nuestros cursos:</h1>
        </div>
      </FadeIn>
      <div className="row">
          <FiltrosCursos
            setFiltros={setFiltros}
            aplicarFiltros={aplicarFiltros}
            limpiarFiltros={limpiarFiltros}
            categories={[...new Set(allCourses.map((c) => c.category))]}
            difficulties={[...new Set(allCourses.map((c) => c.difficulty))]}
            durations={[...new Set(allCourses.map((c) => c.duration))]}
            maxPrice={maxPrice}
          />
        <section className="col-12 col-lg-9">
          <div className="containerCursos row g-4" ref={coursesHeaderRef}>
            {currentCourses.map((course) => (
              <div
                key={course._id || course.id}
                className="col-12 col-sm-6 col-md-6 col-lg-6"
              >
                <CartaCurso
                  courseId={course.courseId || course._id || course.id}
                  name={course.courseName || course.name}
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
          
          {/* Paginación - siempre visible */}
          <div className="d-flex justify-content-center align-items-center mt-4">
            <Pagination className="mb-0">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || totalPages === 0}
                className="custom-pagination-item"
              />
              {totalPages > 0 ? (
                getPageNumbers().map((number) => (
                  <Pagination.Item
                    key={number}
                    active={number === currentPage}
                    onClick={() => handlePageChange(number)}
                    className="custom-pagination-item"
                  >
                    {number}
                  </Pagination.Item>
                ))
              ) : (
                <Pagination.Item active disabled className="custom-pagination-item">
                  1
                </Pagination.Item>
              )}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalPages === 0}
                className="custom-pagination-item"
              />
            </Pagination>
            <div className="ms-3 text-white">
              <small>
                Página {currentPage} de {totalPages || 1} ({courses.length} cursos)
              </small>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}