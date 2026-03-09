import React, { useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pagination, Modal, Button } from "react-bootstrap";
import { FadeIn } from "../../FadeIn/FadeIn";
import { useUserCourses } from "../../../hooks/useApi";
import { apiService } from "../../../services/apiService";
import { generateCertificatePdf } from "../../../utils/certificatePdf";
import "../Gestion/Gestion.css";
import "./Cursos.css";

const ITEMS_PER_PAGE = 6;
const MAX_PAGES_TO_SHOW = 5;
const PARTIAL_AVG_MIN = 60;
const FINAL_TEST_MIN = 70;

const DIFFICULTY_OPTIONS = ["", "Principiante", "Intermedio", "Avanzado"];

const defaultFilters = {
  keywords: "",
  progressMin: 0,
  progressMax: 100,
  estadoProgreso: "", // "" | "finalizados" | "en_progreso"
  dificultad: "",
  categoria: "",
  dateFrom: "",
  dateTo: "",
};

export function Cursos({ user }) {
  const navigate = useNavigate();
  const userId = user?._id || user?.id;
  const { courses: cursosFromApi, loading } = useUserCourses(userId);
  const cursos = Array.isArray(cursosFromApi) ? cursosFromApi : [];
  const [currentPage, setCurrentPage] = useState(1);
  const [filtros, setFiltros] = useState(defaultFilters);
  const [summaryModalCourse, setSummaryModalCourse] = useState(null);
  const cursosListRef = useRef(null);

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
    const totalItems = totalLessons + 1;
    const completedItems = completedLessons + (course.finalTestLastScore != null ? 1 : 0);
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  /** Estado del curso para la badge: "aprobado" | "reprobado" | "en_curso" */
  const getCourseStatus = (curso) => {
    const progress = calculateProgress(curso);
    if (progress < 100) return "en_curso";
    const modules = Array.isArray(curso.modulesCompleted) ? curso.modulesCompleted : [];
    const partialModules = modules.filter((m) => String(m?.moduleId) !== "final");
    const partials = partialModules.map((m) => m?.lastTestScore ?? null);
    const scoresOnly = partials.filter((s) => s != null && typeof s === "number");
    const avgPartial =
      scoresOnly.length > 0
        ? Math.round((scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length) * 10) / 10
        : null;
    const finalScore = curso.finalTestLastScore ?? null;
    const hasFinalScore = finalScore != null && typeof finalScore === "number";
    const passed =
      hasFinalScore && avgPartial != null && avgPartial >= PARTIAL_AVG_MIN && finalScore >= FINAL_TEST_MIN;
    return passed ? "aprobado" : "reprobado";
  };

  const categoriasUnicas = useMemo(
    () => [...new Set(cursos.map((c) => c.category).filter(Boolean))].sort(),
    [cursos]
  );

  const cursosFiltered = useMemo(() => {
    const { keywords, progressMin, progressMax, estadoProgreso, dificultad, categoria, dateFrom, dateTo } = filtros;
    return cursos.filter((curso) => {
      const progress = calculateProgress(curso);
      const nameMatch =
        !keywords.trim() ||
        (curso.courseName || "")
          .toLowerCase()
          .includes(keywords.trim().toLowerCase());
      const progressMatch = progress >= (Number(progressMin) || 0) && progress <= (Number(progressMax) ?? 100);
      const estadoMatch =
        !estadoProgreso ||
        (estadoProgreso === "finalizados" && progress >= 100) ||
        (estadoProgreso === "en_progreso" && progress < 100);
      const difficultyMatch =
        !dificultad.trim() ||
        (String(curso.difficulty || "").toLowerCase() === dificultad.trim().toLowerCase());
      const categoryMatch =
        !categoria.trim() ||
        (String(curso.category || "").trim().toLowerCase() === categoria.trim().toLowerCase());
      const enrolled = curso.dateEnrolled ? new Date(curso.dateEnrolled) : null;
      const fromOk = !dateFrom || (enrolled && enrolled >= new Date(dateFrom + "T00:00:00"));
      const toOk = !dateTo || (enrolled && enrolled <= new Date(dateTo + "T23:59:59.999"));
      return nameMatch && progressMatch && estadoMatch && difficultyMatch && categoryMatch && fromOk && toOk;
    });
  }, [cursos, filtros]);

  const totalPages = Math.max(1, Math.ceil(cursosFiltered.length / ITEMS_PER_PAGE));
  const effectivePage = Math.min(currentPage, totalPages);
  const indexOfLast = effectivePage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentCursos = useMemo(
    () => cursosFiltered.slice(indexOfFirst, indexOfLast),
    [cursosFiltered, indexOfFirst, indexOfLast]
  );

  /** Resumen para el modal (mismo cálculo que CursoVista). */
  const summaryData = useMemo(() => {
    const curso = summaryModalCourse;
    if (!curso) return { partials: [], avgPartial: null, finalScore: null, passed: false, finalGrade: null };
    const modules = Array.isArray(curso.modulesCompleted) ? curso.modulesCompleted : [];
    const partialModules = modules.filter((m) => String(m?.moduleId) !== "final");
    const partials = partialModules.map((m) => ({
      moduleName: m?.moduleName || `Módulo ${m?.moduleId ?? ""}`,
      score: m?.lastTestScore ?? null,
    }));
    const scoresOnly = partials.map((p) => p.score).filter((s) => s != null && typeof s === "number");
    const avgPartial =
      scoresOnly.length > 0
        ? Math.round((scoresOnly.reduce((a, b) => a + b, 0) / scoresOnly.length) * 10) / 10
        : null;
    const finalScore = curso.finalTestLastScore ?? null;
    const hasFinalScore = finalScore != null && typeof finalScore === "number";
    const passed =
      hasFinalScore && avgPartial != null && avgPartial >= PARTIAL_AVG_MIN && finalScore >= FINAL_TEST_MIN;
    const finalGrade = passed ? Math.round((finalScore * 0.6 + avgPartial * 0.4) * 10) / 10 : null;
    return { partials, avgPartial, finalScore, passed, finalGrade };
  }, [summaryModalCourse]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  const handleProgressRange = (e) => {
    const { name, value } = e.target;
    const num = Number(value);
    setFiltros((prev) => {
      const next = { ...prev, [name]: num };
      if (name === "progressMin" && num > (Number(prev.progressMax) ?? 100)) next.progressMax = num;
      if (name === "progressMax" && num < (Number(prev.progressMin) || 0)) next.progressMin = num;
      return next;
    });
    setCurrentPage(1);
  };

  const limpiarFiltros = () => {
    setFiltros(defaultFilters);
    setCurrentPage(1);
  };

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

  const handlePageChange = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    cursosListRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleVerCertificado = async () => {
    const userId = user?.id ?? user?._id;
    const curso = summaryModalCourse;
    if (!userId || !curso?.courseId) return;
    try {
      const res = await apiService.getCourseCertificate(userId, curso.courseId);
      if (res?.status === "success" && res?.payload) {
        await generateCertificatePdf(res.payload, curso);
      }
    } catch (e) {
      console.error("Error al obtener certificado:", e);
    } finally {
      setSummaryModalCourse(null);
    }
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
          <div className="text-center my-5 d-flex flex-column align-items-center col-12">
            <i className="bi bi-book-half mb-4 custom-display-1 text-orange"></i>
            <h3>
              Tu travesía aún no comienza.
            </h3>
            <p className="fst-italic">
              ¡Estamos a la espera de que te embarques en una nueva aventura!
            </p>
            <Link to="/cursos" className="btn btn-warning my-3">
              Ver cursos
            </Link>
          </div>
        ) : (
          <>
          <div className="row mb-4">
            <div className="portafolio-filters col-12 mb-4">
              <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
              <div className="row g-2 portafolio-modal-filters">
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label" htmlFor="keywords-progreso">Palabras clave</label>
                  <input
                    type="text"
                    name="keywords"
                    id="keywords-progreso"
                    className="form-control portafolio-input form-control-sm"
                    value={filtros.keywords}
                    onChange={handleFilterChange}
                    placeholder="Nombre del curso"
                  />
                </div>
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label" htmlFor="estadoProgreso">Estado</label>
                  <select
                    name="estadoProgreso"
                    id="estadoProgreso"
                    className="form-select portafolio-input form-control-sm"
                    value={filtros.estadoProgreso}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    <option value="en_progreso">En progreso (&lt;100%)</option>
                    <option value="finalizados">Finalizados (100%)</option>
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Progreso (%)</label>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="flex-grow-1">
                      <input
                        type="number"
                        name="progressMin"
                        id="progressMin"
                        min="0"
                        max="100"
                        value={filtros.progressMin}
                        className="form-control portafolio-input form-control-sm"
                        onChange={handleProgressRange}
                        placeholder="Mín"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <input
                        type="number"
                        name="progressMax"
                        id="progressMax"
                        min="0"
                        max="100"
                        value={filtros.progressMax}
                        className="form-control portafolio-input form-control-sm"
                        onChange={handleProgressRange}
                        placeholder="Máx"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label" htmlFor="dificultad">Dificultad</label>
                  <select
                    name="dificultad"
                    id="dificultad"
                    className="form-select portafolio-input form-control-sm"
                    value={filtros.dificultad}
                    onChange={handleFilterChange}
                  >
                    {DIFFICULTY_OPTIONS.map((opt) => (
                      <option key={opt || "todos"} value={opt}>{opt || "Todos"}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label" htmlFor="categoria">Categoría</label>
                  <select
                    name="categoria"
                    id="categoria"
                    className="form-select portafolio-input form-control-sm"
                    value={filtros.categoria}
                    onChange={handleFilterChange}
                  >
                    <option value="">Todos</option>
                    {categoriasUnicas.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-sm-6 col-lg-4 portafolio-modal-filter-item">
                  <label className="portafolio-modal-filter-label">Fecha de inscripción</label>
                  <div className="d-flex gap-2 align-items-center">
                    <div className="flex-grow-1">
                      <input
                        type="date"
                        name="dateFrom"
                        id="dateFrom"
                        className="form-control portafolio-input form-control-sm"
                        value={filtros.dateFrom}
                        onChange={handleFilterChange}
                        placeholder="Desde"
                        title="Desde"
                      />
                    </div>
                    <div className="flex-grow-1">
                      <input
                        type="date"
                        name="dateTo"
                        id="dateTo"
                        className="form-control portafolio-input form-control-sm"
                        value={filtros.dateTo}
                        onChange={handleFilterChange}
                        placeholder="Hasta"
                        title="Hasta"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3 flota-filters-actions">
                <button type="button" className="btn btn-outline-orange btn-sm" onClick={limpiarFiltros}>
                  <i className="bi bi-funnel me-1"></i>Limpiar filtros
                </button>
              </div>
            </div>
          </div>
          <div ref={cursosListRef}>
          {cursosFiltered.length === 0 ? (
            <div className="text-center text-white py-5">
              <i className="bi bi-book-half text-orange" style={{ fontSize: "4rem" }}></i>
              <p className="mt-3">No hay cursos que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="row g-4">
            {currentCursos.map((curso, index) => {
              const progress = calculateProgress(curso);
              const modules = Array.isArray(curso.modulesCompleted) ? curso.modulesCompleted : [];
              const status = getCourseStatus(curso);
              const statusLabel = status === "aprobado" ? "Aprobado" : status === "reprobado" ? "Reprobado" : "En curso";

              return (
                <div
                  key={`curso-${curso.courseId}-${index}`}
                  className="col-12 col-md-4"
                >
                  <div className="dashboard-item-build-cursos cursos-card h-100 d-flex flex-column">
                    <div className="cursos-card-image-wrapper position-relative">
                      <div
                        className="cursos-card-image-wrap"
                        style={{ backgroundImage: curso.bannerUrl ? `url(${curso.bannerUrl})` : undefined }}
                        role="img"
                        aria-label={curso.courseName}
                      />
                      <span
                        className={`cursos-card-status-badge cursos-card-status-badge--${status}`}
                        aria-label={`Estado: ${statusLabel}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

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
                        {progress >= 100 ? (
                          <button
                            type="button"
                            className="btn btn-warning btn-sm"
                            onClick={() => setSummaryModalCourse(curso)}
                          >
                            Ver resumen
                          </button>
                        ) : (
                          <Link
                            to={`/course/${curso.courseId}/learn`}
                            className="btn btn-warning btn-sm"
                          >
                            Ir al curso
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
          </div>

          <div className="d-flex flex-column align-items-center mt-4 mb-4">
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
                onClick={() => handlePageChange(totalPages || 1)}
                disabled={effectivePage === (totalPages || 1) || totalPages === 0}
                className="custom-pagination-item"
              />
            </Pagination>
            <div className="text-white mt-2">
              Página {effectivePage} de {totalPages || 1} ({cursosFiltered.length} cursos)
            </div>
          </div>
          </>
        )}
      </div>
      </div>

      <Modal
        show={!!summaryModalCourse}
        onHide={() => setSummaryModalCourse(null)}
        centered
        className="curso-vista-summary-modal"
        contentClassName="curso-vista-summary-modal-content"
      >
        <Modal.Header closeButton closeVariant="white" className="curso-vista-summary-modal-header">
          <Modal.Title className="text-orange">Resumen del curso</Modal.Title>
        </Modal.Header>
        <Modal.Body className="curso-vista-summary-modal-body">
          <h6 className="text-white mb-2">Pruebas parciales</h6>
          <ul className="curso-vista-summary-list mb-3">
            {summaryData.partials.map((p, i) => (
              <li key={i} className="d-flex justify-content-between">
                <span className="text-white-50">{p.moduleName}</span>
                <span className="text-white">{p.score != null ? `${p.score}%` : "—"}</span>
              </li>
            ))}
          </ul>
          <p className="mb-1 text-white-50">
            Promedio pruebas parciales: <strong className="text-white">{summaryData.avgPartial != null ? `${summaryData.avgPartial}%` : "—"}</strong>
            {summaryData.avgPartial != null && (
              <span className="ms-1">(mínimo requerido: {PARTIAL_AVG_MIN}%)</span>
            )}
          </p>
          <p className="mb-3 text-white-50">
            Prueba final: <strong className="text-white">{summaryData.finalScore != null ? `${summaryData.finalScore}%` : "—"}</strong>
            <span className="ms-1">(mínimo requerido: {FINAL_TEST_MIN}%)</span>
          </p>
          <hr className="border-secondary" />
          {summaryData.passed ? (
            <div className="curso-vista-summary-verdict passed">
              <p className="text-success fw-bold mb-1">Curso aprobado</p>
              <p className="text-white-50 mb-0">
                Nota final: <strong className="text-orange">{summaryData.finalGrade}%</strong>
                <span className="d-block small mt-1">(60% prueba final + 40% promedio de pruebas parciales)</span>
              </p>
              <Button
                variant="success"
                className="mt-3"
                onClick={handleVerCertificado}
              >
                <i className="bi bi-award-fill me-2" />
                Ver certificado
              </Button>
            </div>
          ) : (
            <div className="curso-vista-summary-verdict failed">
              <p className="text-danger fw-bold mb-2">Curso reprobado</p>
              <p className="text-white-50 mb-0">
                {summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN && summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN && (
                  <>No se alcanzó el promedio mínimo de pruebas parciales ({PARTIAL_AVG_MIN}%) ni el mínimo de la prueba final ({FINAL_TEST_MIN}%). Deberá recursar el curso.</>
                )}
                {summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN && (summaryData.finalScore == null || summaryData.finalScore >= FINAL_TEST_MIN) && (
                  <>No se alcanzó el promedio mínimo de las pruebas parciales ({PARTIAL_AVG_MIN}%). Deberá recursar el curso.</>
                )}
                {summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN && (summaryData.avgPartial == null || summaryData.avgPartial >= PARTIAL_AVG_MIN) && (
                  <>No se alcanzó el mínimo requerido en la prueba final ({FINAL_TEST_MIN}%). Deberá recursar el curso.</>
                )}
                {summaryData.avgPartial == null && summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN && (
                  <>No se alcanzó el mínimo requerido en la prueba final ({FINAL_TEST_MIN}%). Deberá recursar el curso.</>
                )}
                {summaryData.finalScore == null && summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN && (
                  <>No se alcanzó el promedio mínimo de las pruebas parciales ({PARTIAL_AVG_MIN}%). Deberá recursar el curso.</>
                )}
                {!((summaryData.avgPartial != null && summaryData.avgPartial < PARTIAL_AVG_MIN) || (summaryData.finalScore != null && summaryData.finalScore < FINAL_TEST_MIN)) && (
                  <>No se alcanzaron los requisitos mínimos para aprobar. Deberá recursar el curso.</>
                )}
              </p>
              <Button
                variant="warning"
                className="btn mt-3 btn-orange"
                onClick={() => {
                  setSummaryModalCourse(null);
                  navigate(`/course/buy/${summaryModalCourse?.courseId}`);
                }}
              >
                <i className="bi bi-arrow-repeat me-2" />
                Cursar nuevamente
              </Button>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </FadeIn>
  );
}
