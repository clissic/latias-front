import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Table, Modal, Pagination } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./BuscarCurso.css";

export function BuscarCurso({ onUpdateCourse }) {
  const [filters, setFilters] = useState({
    courseId: "",
    sku: "",
    courseName: "",
    category: "",
    difficulty: "",
    minPrice: "",
    maxPrice: "",
    minDuration: "",
    maxDuration: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const tableHeaderRef = useRef(null);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(false);
    try {
      // Obtener todos los cursos
      const response = await apiService.getCourses();
      
      if (response.status === "success" && response.payload) {
        let filteredCourses = [...response.payload];

        // Aplicar filtros
        if (filters.courseId.trim()) {
          filteredCourses = filteredCourses.filter((course) =>
            course.courseId?.toLowerCase().includes(filters.courseId.toLowerCase())
          );
        }

        if (filters.sku.trim()) {
          filteredCourses = filteredCourses.filter((course) =>
            course.sku?.toLowerCase().includes(filters.sku.toLowerCase())
          );
        }

        if (filters.courseName.trim()) {
          filteredCourses = filteredCourses.filter((course) =>
            course.courseName?.toLowerCase().includes(filters.courseName.toLowerCase())
          );
        }

        if (filters.category.trim()) {
          filteredCourses = filteredCourses.filter((course) =>
            course.category?.toLowerCase() === filters.category.toLowerCase()
          );
        }

        if (filters.difficulty.trim()) {
          filteredCourses = filteredCourses.filter((course) =>
            course.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
          );
        }

        if (filters.minPrice) {
          const minPrice = parseFloat(filters.minPrice);
          filteredCourses = filteredCourses.filter(
            (course) => course.price >= minPrice
          );
        }

        if (filters.maxPrice) {
          const maxPrice = parseFloat(filters.maxPrice);
          filteredCourses = filteredCourses.filter(
            (course) => course.price <= maxPrice
          );
        }

        if (filters.minDuration) {
          const minDuration = parseFloat(filters.minDuration);
          filteredCourses = filteredCourses.filter(
            (course) => course.duration >= minDuration
          );
        }

        if (filters.maxDuration) {
          const maxDuration = parseFloat(filters.maxDuration);
          filteredCourses = filteredCourses.filter(
            (course) => course.duration <= maxDuration
          );
        }

        setResults(filteredCourses);
        setSearched(true);

        if (filteredCourses.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin resultados",
            text: "No se encontraron cursos con los filtros seleccionados",
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
          text: "No se pudieron obtener los cursos",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Error al buscar cursos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al buscar los cursos",
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

  const handleReset = () => {
    setFilters({
      courseId: "",
      sku: "",
      courseName: "",
      category: "",
      difficulty: "",
      minPrice: "",
      maxPrice: "",
      minDuration: "",
      maxDuration: "",
    });
    setResults([]);
    setSearched(false);
    setCurrentPage(1);
  };

  // Resetear a página 1 cuando cambian los resultados
  useEffect(() => {
    setCurrentPage(1);
  }, [results.length]);

  // Calcular paginación
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentResults = results.slice(indexOfFirstItem, indexOfLastItem);

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
    if (tableHeaderRef.current) {
      tableHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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

  const handleUpdateClick = (course) => {
    if (onUpdateCourse) {
      onUpdateCourse(course);
    }
  };

  const handleDeleteClick = (course) => {
    setCourseToDelete(course);
    setConfirmText("");
    setShowDeleteModal(true);
  };

  const handleDeleteCourse = async () => {
    if (confirmText === "eliminar") {
      try {
        const response = await apiService.deleteCourse(courseToDelete.courseId);
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Curso eliminado",
            text: response.msg || "El curso ha sido eliminado correctamente.",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          }).then(() => {
            setShowDeleteModal(false);
            setCourseToDelete(null);
            setConfirmText("");
            // Actualizar la lista de resultados eliminando el curso eliminado
            setResults(results.filter(course => course.courseId !== courseToDelete.courseId));
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.msg || "No se pudo eliminar el curso.",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
        }
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Hubo un problema al eliminar el curso.",
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
        text: "Debes escribir 'eliminar' para confirmar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  return (
    <div className="buscar-curso-container">
      <div className="filters-section mb-4">
        <h5 className="text-orange mb-3">Filtros de búsqueda:</h5>
        <Form>
          <div className="row g-3">
            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Course ID:</Form.Label>
              <Form.Control
                type="text"
                name="courseId"
                value={filters.courseId}
                onChange={handleFilterChange}
                placeholder="Buscar por Course ID"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">SKU:</Form.Label>
              <Form.Control
                type="text"
                name="sku"
                value={filters.sku}
                onChange={handleFilterChange}
                placeholder="Ej: NAV-COS-001"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Nombre del curso:</Form.Label>
              <Form.Control
                type="text"
                name="courseName"
                value={filters.courseName}
                onChange={handleFilterChange}
                placeholder="Buscar por nombre"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Categoría:</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                placeholder="Ej: Navegación"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Dificultad:</Form.Label>
              <Form.Select
                name="difficulty"
                value={filters.difficulty}
                onChange={handleFilterChange}
                className="bg-dark text-white border-secondary"
              >
                <option value="">Todas</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-12 col-md-3">
              <Form.Label className="text-white">Precio mínimo:</Form.Label>
              <Form.Control
                type="number"
                name="minPrice"
                value={filters.minPrice}
                onChange={handleFilterChange}
                placeholder="0"
                min="0"
                step="0.01"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-3">
              <Form.Label className="text-white">Precio máximo:</Form.Label>
              <Form.Control
                type="number"
                name="maxPrice"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                placeholder="999999"
                min="0"
                step="0.01"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-3">
              <Form.Label className="text-white">Duración mínima (horas):</Form.Label>
              <Form.Control
                type="number"
                name="minDuration"
                value={filters.minDuration}
                onChange={handleFilterChange}
                placeholder="0"
                min="0"
                step="0.1"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-3">
              <Form.Label className="text-white">Duración máxima (horas):</Form.Label>
              <Form.Control
                type="number"
                name="maxDuration"
                value={filters.maxDuration}
                onChange={handleFilterChange}
                placeholder="999"
                min="0"
                step="0.1"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>
          </div>

          <div className="d-flex gap-2 mt-4">
            <Button
              variant="success"
              onClick={handleSearch}
              disabled={loading}
              className="flex-grow-1"
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Buscando...
                </>
              ) : (
                <>
                  <i className="bi bi-search me-2"></i>
                  BUSCAR
                </>
              )}
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              disabled={loading}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              Limpiar
            </Button>
          </div>
        </Form>
      </div>

      {searched && (
        <div className="results-section">
          <h5 className="text-orange mb-3" ref={tableHeaderRef}>
            Resultados: {results.length} curso(s) encontrado(s)
          </h5>
          {results.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table striped bordered hover variant="dark" className="table-dark">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>SKU</th>
                      <th>Nombre</th>
                      <th>Categoría</th>
                      <th>Dificultad</th>
                      <th>Duración</th>
                      <th>Precio</th>
                      <th>Módulos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResults.map((course) => (
                    <tr key={course._id || course.courseId}>
                      <td>
                        {course.courseId ? (
                          <i
                            className="bi bi-clipboard-fill cursor-pointer text-orange"
                            title={course.courseId}
                            onClick={() => handleCopyCourseId(course.courseId)}
                            style={{ cursor: "pointer", fontSize: "1.2rem" }}
                          ></i>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td>{course.sku || "N/A"}</td>
                      <td>{course.courseName || "N/A"}</td>
                      <td>{course.category || "N/A"}</td>
                      <td>{course.difficulty || "N/A"}</td>
                      <td>{course.duration || 0} horas</td>
                      <td>${course.price || 0} {course.currency || "USD"}</td>
                      <td>{course.modules?.length || 0}</td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span
                            className="action-link"
                            onClick={() => handleUpdateClick(course)}
                          >
                            <i className="bi bi-pencil-fill me-1"></i>
                            Modificar
                          </span>
                          <span
                            className="action-link action-link-danger"
                            onClick={() => handleDeleteClick(course)}
                          >
                            <i className="bi bi-trash-fill me-1"></i>
                            Eliminar
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
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
                    Página {currentPage} de {totalPages || 1} ({results.length} registros)
                  </small>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-white py-4">
              <p>No se encontraron cursos con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => {
        setShowDeleteModal(false);
        setCourseToDelete(null);
        setConfirmText("");
      }} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-white">
            ¿Estás seguro de que deseas eliminar el curso <strong>{courseToDelete?.courseName || "este curso"}</strong>?
          </p>
          <p className="text-white">Escribe "eliminar" para confirmar:</p>
          <Form.Control 
            type="text" 
            value={confirmText} 
            onChange={(e) => setConfirmText(e.target.value)}
            className="bg-dark text-white border-secondary"
          />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowDeleteModal(false);
            setCourseToDelete(null);
            setConfirmText("");
          }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteCourse}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

