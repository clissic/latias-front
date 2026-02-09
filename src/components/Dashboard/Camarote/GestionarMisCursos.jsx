import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import { SolicitarModificacionCurso } from "./SolicitarModificacionCurso";
import "./GestionarMisCursos.css";

export function GestionarMisCursos({ user, onBack }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);

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
        <div className="table-responsive">
          <Table striped bordered hover variant="dark" className="table-dark">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre del curso</th>
                <th>Dificultad</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course._id || course.courseId}>
                  <td>
                    {course.courseId ? (
                      <div className="d-flex align-items-center gap-2">
                        <i
                          className="bi bi-clipboard-fill cursor-pointer text-orange"
                          title={course.courseId}
                          onClick={() => handleCopyCourseId(course.courseId)}
                          style={{ cursor: "pointer", fontSize: "1.2rem" }}
                        ></i>
                      </div>
                    ) : (
                      <span className="text-truncate d-inline-block" style={{ maxWidth: "100px" }}>
                        {course._id}
                      </span>
                    )}
                  </td>
                  <td>{course.courseName || "N/A"}</td>
                  <td>
                    <span className={`badge ${
                      course.difficulty === "Principiante" ? "bg-success" :
                      course.difficulty === "Intermedio" ? "bg-warning" :
                      course.difficulty === "Avanzado" ? "bg-danger" :
                      "bg-secondary"
                    }`}>
                      {course.difficulty || "N/A"}
                    </span>
                  </td>
                  <td>{course.category || "N/A"}</td>
                  <td className="text-white fw-bold">
                    {course.price ? formatPrice(course.price, course.currency || "UYU") : "N/A"}
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-1">
                      <span
                        className="action-link"
                        onClick={() => handleViewMetrics(course)}
                      >
                        <i className="bi bi-graph-up me-1"></i>
                        Ver métricas
                      </span>
                      <span
                        className="action-link"
                        onClick={() => handleModifyCourse(course)}
                      >
                        <i className="bi bi-pencil-square-fill me-1"></i>
                        Modificar curso
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
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
