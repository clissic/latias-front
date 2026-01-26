import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Table, Modal, Pagination } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./BuscarCurso.css";

export function BuscarUsuario({ onUpdateUser }) {
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    email: "",
    ci: "",
    category: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
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
      const response = await apiService.getAllUsers();
      
      if (response.status === "success" && response.payload) {
        let filteredUsers = [...response.payload];

        if (filters.firstName.trim()) {
          filteredUsers = filteredUsers.filter((user) =>
            user.firstName?.toLowerCase().includes(filters.firstName.toLowerCase())
          );
        }

        if (filters.lastName.trim()) {
          filteredUsers = filteredUsers.filter((user) =>
            user.lastName?.toLowerCase().includes(filters.lastName.toLowerCase())
          );
        }

        if (filters.email.trim()) {
          filteredUsers = filteredUsers.filter((user) =>
            user.email?.toLowerCase().includes(filters.email.toLowerCase())
          );
        }

        if (filters.ci.trim()) {
          filteredUsers = filteredUsers.filter((user) =>
            user.ci?.toString().includes(filters.ci)
          );
        }

        if (filters.category.trim()) {
          filteredUsers = filteredUsers.filter((user) =>
            user.category?.toLowerCase() === filters.category.toLowerCase()
          );
        }

        setResults(filteredUsers);
        setSearched(true);

        if (filteredUsers.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin resultados",
            text: "No se encontraron usuarios con los filtros seleccionados",
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
          text: "No se pudieron obtener los usuarios",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Error al buscar usuarios:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al buscar los usuarios",
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
      firstName: "",
      lastName: "",
      email: "",
      ci: "",
      category: "",
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

  const handleCopyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "ID copiado al portapapeles",
        timer: 1500,
        showConfirmButton: false,
        background: "#082b55",
        color: "#ffffff",
      });
    } catch (error) {
      console.error("Error al copiar:", error);
    }
  };

  const handleUpdateClick = (user) => {
    if (onUpdateUser) {
      onUpdateUser(user);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setConfirmText("");
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    if (confirmText === "eliminar") {
      try {
        const response = await apiService.deleteUserById(userToDelete._id);
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Usuario eliminado",
            text: response.msg || "El usuario ha sido eliminado correctamente.",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          }).then(() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
            setConfirmText("");
            setResults(results.filter(user => user._id !== userToDelete._id));
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.msg || "No se pudo eliminar el usuario.",
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
          text: "Hubo un problema al eliminar el usuario.",
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
              <Form.Label className="text-white">Nombre:</Form.Label>
              <Form.Control
                type="text"
                name="firstName"
                value={filters.firstName}
                onChange={handleFilterChange}
                placeholder="Buscar por nombre"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Apellido:</Form.Label>
              <Form.Control
                type="text"
                name="lastName"
                value={filters.lastName}
                onChange={handleFilterChange}
                placeholder="Buscar por apellido"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Email:</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={filters.email}
                onChange={handleFilterChange}
                placeholder="Buscar por email"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">CI:</Form.Label>
              <Form.Control
                type="text"
                name="ci"
                value={filters.ci}
                onChange={handleFilterChange}
                placeholder="Buscar por CI"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Categoría:</Form.Label>
              <Form.Select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="bg-dark text-white border-secondary"
              >
                <option value="">Todas</option>
                <option value="Cadete">Cadete</option>
                <option value="Instructor">Instructor</option>
                <option value="Administrador">Administrador</option>
              </Form.Select>
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
            Resultados: {results.length} usuario(s) encontrado(s)
          </h5>
          {results.length > 0 ? (
            <>
              <div className="table-responsive">
                <Table striped bordered hover variant="dark" className="table-dark">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombre</th>
                      <th>Apellido</th>
                      <th>Email</th>
                      <th>CI</th>
                      <th>Categoría</th>
                      <th>Rango</th>
                      <th>Cursos</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentResults.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <i
                          className="bi bi-clipboard-fill cursor-pointer text-orange"
                          title={user._id}
                          onClick={() => handleCopyId(user._id)}
                          style={{ cursor: "pointer", fontSize: "1.2rem" }}
                        ></i>
                      </td>
                      <td>{user.firstName || "N/A"}</td>
                      <td>{user.lastName || "N/A"}</td>
                      <td>{user.email || "N/A"}</td>
                      <td>{user.ci || "N/A"}</td>
                      <td>{user.category || "N/A"}</td>
                      <td>{user.rank?.title || "N/A"}</td>
                      <td>
                        {Array.isArray(user.purchasedCourses) && user.purchasedCourses.length > 0 ? (
                          <div style={{ maxWidth: "200px" }}>
                            {user.purchasedCourses.map((course, index) => (
                              <div key={course.courseId || index} className="mb-1">
                                <span className="badge bg-info text-dark">
                                  {course.courseName || `Curso ${index + 1}`}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">Sin cursos</span>
                        )}
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span
                            className="action-link"
                            onClick={() => handleUpdateClick(user)}
                          >
                            <i className="bi bi-pencil-fill me-1"></i>
                            Modificar
                          </span>
                          <span
                            className="action-link action-link-danger"
                            onClick={() => handleDeleteClick(user)}
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
              <p>No se encontraron usuarios con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      )}

      <Modal show={showDeleteModal} onHide={() => {
        setShowDeleteModal(false);
        setUserToDelete(null);
        setConfirmText("");
      }} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-white">
            ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?
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
            setUserToDelete(null);
            setConfirmText("");
          }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteUser}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
