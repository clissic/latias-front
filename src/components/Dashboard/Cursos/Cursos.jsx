import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Pagination } from "react-bootstrap";
import { FadeIn } from "../../FadeIn/FadeIn";
import { useUserCourses } from "../../../hooks/useApi";
import "../Gestion/Gestion.css";
import "./Cursos.css";

const ITEMS_PER_PAGE = 6;
const MAX_PAGES_TO_SHOW = 5;

export function Cursos({ user }) {
  const userId = user?._id || user?.id;
  const { courses: cursosFromApi, loading } = useUserCourses(userId);
  const cursos = Array.isArray(cursosFromApi) ? cursosFromApi : [];
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(cursos.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);
  const indexOfLast = effectivePage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentCursos = useMemo(
    () => cursos.slice(indexOfFirst, indexOfLast),
    [cursos, indexOfFirst, indexOfLast]
  );

  const getPageNumbers = () => {
    const pages = [];
    let start = Math.max(1, effectivePage - Math.floor(MAX_PAGES_TO_SHOW / 2));
    let end = Math.min(totalPages, start + MAX_PAGES_TO_SHOW - 1);
    if (end - start < MAX_PAGES_TO_SHOW - 1) {
      start = Math.max(1, end - MAX_PAGES_TO_SHOW + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (page) => setCurrentPage(Math.max(1, Math.min(page, totalPages)));

  const calculateProgress = (course) => {
    const modules = Array.isArray(course.modulesCompleted) ? course.modulesCompleted : [];

    const totalLessons = modules.reduce(
      (acc, module) => acc + (Array.isArray(module.lessons) ? module.lessons.length : 0),
      0
    );

    const completedLessons = modules.reduce((acc, module) => {
      if (!Array.isArray(module.lessons)) return acc;
      return acc + module.lessons.filter((lesson) => lesson.completed).length;
    }, 0);

    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  return (
    <FadeIn>
      <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
        <div className="col-12">
          <h2 className="mb-3 text-orange">Cursos en progreso:</h2>
          <div className="div-border-color my-4"></div>
        </div>

      <div className="col-12">
        {loading ? (
          <div className="text-center my-5">
            <div className="spinner-border text-orange" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-white mt-3">Cargando tus cursos...</p>
          </div>
        ) : cursos.length === 0 ? (
          <div className="text-center my-5 d-flex flex-column align-items-center col-11">
            <i className="bi bi-book-half mb-4 custom-display-1 text-orange"></i>
            <h3>
              Tu travesía aún no comienza.
            </h3>
            <p className="fst-italic">
              ¡Estamos a la espera de que te embarques en una nueva aventura!
            </p>
          </div>
        ) : (
          <>
          <div className="row g-4">
            {currentCursos.map((curso, index) => {
              const progress = calculateProgress(curso);
              const modules = Array.isArray(curso.modulesCompleted) ? curso.modulesCompleted : [];

              return (
                <div
                  key={`curso-${curso.courseId}-${index}`}
                  className="col-12 col-md-4"
                >
                  <div className="dashboard-item-build-cursos cursos-card h-100 d-flex flex-column">
                    <div
                      className="cursos-card-image-wrap"
                      style={{ backgroundImage: curso.bannerUrl ? `url(${curso.bannerUrl})` : undefined }}
                      role="img"
                      aria-label={curso.courseName}
                    />

                    <div className="cursos-card-body d-flex flex-column flex-grow-1">
                      <h3 className="text-orange cursos-card-title">{curso.courseName}</h3>
                      <p className="d-flex align-items-center gap-2 mb-1 small">
                        <i className="bi bi-bar-chart-fill"></i> Progreso: {progress}%
                      </p>
                      <p className="d-flex align-items-center gap-2 mb-3 small">
                        <i className="bi bi-calendar-event-fill"></i> Inscripción: {curso.dateEnrolled ? new Date(curso.dateEnrolled).toLocaleDateString() : "—"}
                      </p>

                      <div className="cursos-card-modules mt-auto">
                        <p className="fw-bold mb-2 small">Módulos:</p>
                        <div className="modules-progress d-flex flex-wrap justify-content-center">
                          {modules.map((modulo) => {
                            const lessons = Array.isArray(modulo.lessons) ? modulo.lessons : [];
                            const allLessonsCompleted = lessons.every((lesson) => lesson.completed);

                            return (
                              <div key={modulo.moduleId} className="module-container">
                                <div className="lesson-dots-container">
                                  {lessons.map((leccion) => (
                                    <div
                                      key={leccion.lessonId}
                                      className={`lesson-dot ${leccion.completed ? "completed" : ""}`}
                                      title={leccion.lessonName}
                                    ></div>
                                  ))}
                                </div>
                                <div
                                  className={`module-dot ${allLessonsCompleted ? "completed" : ""}`}
                                  title={modulo.moduleName}
                                ></div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="cursos-card-actions d-flex flex-column gap-2 mt-3">
                        <Link
                          to={`/course/${curso.courseId}`}
                          className="btn btn-warning btn-sm"
                        >
                          Ir al curso
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="d-flex justify-content-center align-items-center mt-4 cursos-progreso-pagination">
            <Pagination className="mb-0">
              <Pagination.First
                onClick={() => handlePageChange(1)}
                disabled={effectivePage === 1 || totalPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Prev
                onClick={() => handlePageChange(effectivePage - 1)}
                disabled={effectivePage === 1 || totalPages === 0}
                className="custom-pagination-item"
              />
              {totalPages > 0 ? (
                getPageNumbers().map((num) => (
                  <Pagination.Item
                    key={num}
                    active={num === effectivePage}
                    onClick={() => handlePageChange(num)}
                    className="custom-pagination-item"
                  >
                    {num}
                  </Pagination.Item>
                ))
              ) : (
                <Pagination.Item active disabled className="custom-pagination-item">
                  1
                </Pagination.Item>
              )}
              <Pagination.Next
                onClick={() => handlePageChange(effectivePage + 1)}
                disabled={effectivePage === totalPages || totalPages === 0}
                className="custom-pagination-item"
              />
              <Pagination.Last
                onClick={() => handlePageChange(totalPages)}
                disabled={effectivePage === totalPages || totalPages === 0}
                className="custom-pagination-item"
              />
            </Pagination>
            <span className="text-white-50 small ms-3">
              Página {effectivePage} de {totalPages} ({cursos.length} cursos)
            </span>
          </div>
          </>
        )}
      </div>
      </div>
    </FadeIn>
  );
}
