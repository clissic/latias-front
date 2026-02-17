import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import { SolicitarModificacionCurso } from "./SolicitarModificacionCurso";
import "./GestionarMisCursos.css";

export function GestionarMisCursos({ user, onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterCourseId, setFilterCourseId] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriceMin, setFilterPriceMin] = useState("");
  const [filterPriceMax, setFilterPriceMax] = useState("");

  useEffect(() => {
    const loadMyCourses = async () => {
      setLoading(true);
      try {
        // Primero obtener el instructor por CI
        const instructorResponse = await apiService.getInstructorByCi(user.ci);
        
        if (instructorResponse.status === "success" && instructorResponse.payload) {
          const instructorData = instructorResponse.payload;
          setInstructor(instructorData);
          const courseIds = instructorData.courses || [];

          if (courseIds.length === 0) {
            setCourses([]);
            setLoading(false);
            return;
          }

          // Obtener todos los cursos y filtrar por los IDs asignados
          const allCoursesResponse = await apiService.getCourses();
          
          if (allCoursesResponse.status === "success" && allCoursesResponse.payload) {
            const allCourses = allCoursesResponse.payload;
            // Los courseIds del instructor son strings (courseId del curso), buscar por courseId
            const myCourses = allCourses.filter(course => {
              // Comparar el courseId del curso con los IDs en el array courses del instructor
              const courseIdToCompare = course.courseId ? String(course.courseId) : null;
              return courseIdToCompare && courseIds.some(id => String(id) === courseIdToCompare);
            });
            setCourses(myCourses);
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "No se pudieron cargar los cursos",
              confirmButtonText: "Aceptar",
              background: "#082b55",
              color: "#ffffff",
              customClass: {
                confirmButton: "custom-swal-button",
              },
            });
          }
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No se encontró información del instructor",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
        }
      } catch (error) {
        console.error("Error al cargar cursos asignados:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Ocurrió un error al cargar los cursos asignados",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadMyCourses();
  }, [user.ci]);

  const handleViewMetrics = (course) => {
    // TODO: Implementar vista de métricas
    Swal.fire({
      icon: "info",
      title: "Métricas",
      text: `Métricas del curso "${course.courseName}" - Próximamente`,
      confirmButtonText: "Aceptar",
      background: "#082b55",
      color: "#ffffff",
      customClass: {
        confirmButton: "custom-swal-button",
      },
    });
  };

  const handleModifyCourse = (course) => {
    setSelectedCourse(course);
  };

  const handleBackToTable = () => {
    setSelectedCourse(null);
  };

  const handleCopyCourseId = async (courseId) => {
    try {
      await navigator.clipboard.writeText(courseId);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "Course ID copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
        background: "#082b55",
        color: "#ffffff",
      });
    } catch (error) {
      console.error("Error al copiar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo copiar el Course ID",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  const formatPrice = (price, currency) => {
    const currencySymbols = {
      'USD': '$',
      'UYU': '$U',
      'EUR': '€',
      'ARS': '$'
    };
    const symbol = currencySymbols[currency] || currency;
    return `${symbol} ${price.toLocaleString()}`;
  };

  const filteredCourses = courses.filter((course) => {
    if (filterName && !(course.courseName || "").toLowerCase().includes(filterName.toLowerCase())) return false;
    if (filterCourseId && !(String(course.courseId || "")).toLowerCase().includes(filterCourseId.toLowerCase())) return false;
    if (filterDifficulty && (course.difficulty || "") !== filterDifficulty) return false;
    if (filterCategory && !(course.category || "").toLowerCase().includes(filterCategory.toLowerCase())) return false;
    const price = course.price != null && course.price !== "" ? Number(course.price) : null;
    if (filterPriceMin.trim() !== "") {
      const min = Number(filterPriceMin);
      if (!Number.isFinite(min) || (price == null || price < min)) return false;
    }
    if (filterPriceMax.trim() !== "") {
      const max = Number(filterPriceMax);
      if (!Number.isFinite(max) || (price == null || price > max)) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterName("");
    setFilterCourseId("");
    setFilterDifficulty("");
    setFilterCategory("");
    setFilterPriceMin("");
    setFilterPriceMax("");
  };

  if (loading) {
    return (
      <div className="text-center text-white py-5">
        <div className="spinner-border text-orange" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3">Cargando cursos asignados...</p>
      </div>
    );
  }

  // Si hay un curso seleccionado, mostrar el formulario de solicitud
  if (selectedCourse) {
    return (
      <SolicitarModificacionCurso 
        course={selectedCourse}
        instructor={instructor}
        onBack={handleBackToTable}
      />
    );
  }

  return (
    <div className="gestionar-mis-cursos-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-orange mb-0">Gestionar mis cursos asignados</h4>
      </div>

      {courses.length === 0 ? (
        <div className="text-center text-white py-5">
          <i className="bi bi-book text-orange" style={{ fontSize: "4rem" }}></i>
          <p className="mt-3">No tienes cursos asignados actualmente.</p>
        </div>
      ) : (
        <>
          <div className="portafolio-filters col-12 mb-4">
            <h4 className="text-orange"><i className="bi bi-funnel-fill me-2"></i>Filtros:</h4>
            <div className="row g-2 portafolio-modal-filters">
              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Nombre</label>
                <input type="text" className="form-control portafolio-input form-control-sm" value={filterName} onChange={(e) => setFilterName(e.target.value)} />
              </div>
              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">ID curso</label>
                <input type="text" className="form-control portafolio-input form-control-sm" value={filterCourseId} onChange={(e) => setFilterCourseId(e.target.value)} />
              </div>
              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Dificultad</label>
                <select className="form-select portafolio-input form-control-sm" value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                  <option value="">Todas</option>
                  <option value="Principiante">Principiante</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Categoría</label>
                <input type="text" className="form-control portafolio-input form-control-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} />
              </div>
              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Precio desde</label>
                <input type="number" className="form-control portafolio-input form-control-sm" value={filterPriceMin} onChange={(e) => setFilterPriceMin(e.target.value)} min={0} step={1} placeholder="Mín" />
              </div>
              <div className="col-12 col-sm-6 col-md-4 portafolio-modal-filter-item">
                <label className="portafolio-modal-filter-label">Precio hasta</label>
                <input type="number" className="form-control portafolio-input form-control-sm" value={filterPriceMax} onChange={(e) => setFilterPriceMax(e.target.value)} min={0} step={1} placeholder="Máx" />
              </div>
            </div>
            <div className="d-flex flex-wrap align-items-center justify-content-lg-end gap-2 mt-3">
              <button type="button" className="btn btn-outline-orange btn-sm" onClick={clearFilters}>
                <i className="bi bi-funnel me-1"></i>Borrar filtros
              </button>
            </div>
          </div>

          {filteredCourses.length === 0 ? (
            <div className="text-center text-white py-4 text-white-50">No hay cursos que coincidan con los filtros.</div>
          ) : (
            <div className="flota-certificates-cards">
              {filteredCourses.map((course) => (
                <div key={course._id || course.courseId} className="flota-certificate-card">
                  <div className="flota-certificate-card-body">
                    <div className="flota-certificate-card-main">
                      <div className="flota-certificate-field">
                        <span className="flota-certificate-label">ID</span>
                        <span className="flota-certificate-value d-flex align-items-center gap-2">
                          {course.courseId ? (
                            <>
                              <i
                                className="bi bi-clipboard-fill text-orange"
                                title={course.courseId}
                                onClick={() => handleCopyCourseId(course.courseId)}
                                style={{ cursor: "pointer", fontSize: "1.1rem" }}
                              />
                              <span>{course.courseId}</span>
                            </>
                          ) : (
                            <span className="text-truncate" style={{ maxWidth: "120px" }}>{course._id}</span>
                          )}
                        </span>
                      </div>
                      <div className="flota-certificate-field">
                        <span className="flota-certificate-label">Nombre</span>
                        <span className="flota-certificate-value">{course.courseName || "—"}</span>
                      </div>
                      <div className="flota-certificate-field">
                        <span className="flota-certificate-label">Dificultad</span>
                        <span className="flota-certificate-value">
                          <span className={`badge ${
                            course.difficulty === "Principiante" ? "bg-success" :
                            course.difficulty === "Intermedio" ? "bg-warning" :
                            course.difficulty === "Avanzado" ? "bg-danger" :
                            "bg-secondary"
                          }`}>
                            {course.difficulty || "—"}
                          </span>
                        </span>
                      </div>
                      <div className="flota-certificate-field">
                        <span className="flota-certificate-label">Categoría</span>
                        <span className="flota-certificate-value">{course.category || "—"}</span>
                      </div>
                      <div className="flota-certificate-field">
                        <span className="flota-certificate-label">Precio</span>
                        <span className="flota-certificate-value fw-bold">
                          {course.price != null ? formatPrice(course.price, course.currency || "UYU") : "—"}
                        </span>
                      </div>
                    </div>
                    <div className="flota-certificate-card-actions">
                      <span className="action-link" onClick={() => handleViewMetrics(course)} title="Métricas">
                        <i className="bi bi-bar-chart-line-fill me-1"></i>
                        Métricas
                      </span>
                      <span className="action-link" onClick={() => handleModifyCourse(course)} title="Modificar">
                        <i className="bi bi-pencil-fill me-1"></i>
                        Modificar
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      <div className="mt-4 d-flex justify-content-end">
        <Button 
          variant="outline"
          onClick={onBack}
          className="btn-outline-orange"
        >
          <i className="bi bi-arrow-left-circle-fill me-2"></i>
          Volver
        </Button>
      </div>
    </div>
  );
}
