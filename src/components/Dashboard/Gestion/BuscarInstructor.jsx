import React, { useState } from "react";
import { Form, Button, Table, Modal } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./BuscarCurso.css";

export function BuscarInstructor({ onUpdateInstructor }) {
  const [filters, setFilters] = useState({
    firstName: "",
    lastName: "",
    ci: "",
    profession: "",
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [instructorToDelete, setInstructorToDelete] = useState(null);
  const [confirmText, setConfirmText] = useState("");

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
      const response = await apiService.getInstructors();
      
      if (response.status === "success" && response.payload) {
        let filteredInstructors = [...response.payload];

        if (filters.firstName.trim()) {
          filteredInstructors = filteredInstructors.filter((instructor) =>
            instructor.firstName?.toLowerCase().includes(filters.firstName.toLowerCase())
          );
        }

        if (filters.lastName.trim()) {
          filteredInstructors = filteredInstructors.filter((instructor) =>
            instructor.lastName?.toLowerCase().includes(filters.lastName.toLowerCase())
          );
        }

        if (filters.ci.trim()) {
          filteredInstructors = filteredInstructors.filter((instructor) =>
            instructor.ci?.toString().includes(filters.ci)
          );
        }

        if (filters.profession.trim()) {
          filteredInstructors = filteredInstructors.filter((instructor) =>
            instructor.profession?.toLowerCase().includes(filters.profession.toLowerCase())
          );
        }

        setResults(filteredInstructors);
        setSearched(true);

        if (filteredInstructors.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin resultados",
            text: "No se encontraron instructores con los filtros seleccionados",
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
          text: "No se pudieron obtener los instructores",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Error al buscar instructores:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al buscar los instructores",
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
      ci: "",
      profession: "",
    });
    setResults([]);
    setSearched(false);
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

  const handleUpdateClick = (instructor) => {
    if (onUpdateInstructor) {
      onUpdateInstructor(instructor);
    }
  };

  const handleDeleteClick = (instructor) => {
    setInstructorToDelete(instructor);
    setConfirmText("");
    setShowDeleteModal(true);
  };

  const handleDeleteInstructor = async () => {
    if (confirmText === "eliminar") {
      try {
        const response = await apiService.deleteInstructor(instructorToDelete._id);
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Instructor eliminado",
            text: response.msg || "El instructor ha sido eliminado correctamente.",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          }).then(() => {
            setShowDeleteModal(false);
            setInstructorToDelete(null);
            setConfirmText("");
            setResults(results.filter(inst => inst._id !== instructorToDelete._id));
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.msg || "No se pudo eliminar el instructor.",
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
          text: "Hubo un problema al eliminar el instructor.",
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
              <Form.Label className="text-white">Profesión:</Form.Label>
              <Form.Control
                type="text"
                name="profession"
                value={filters.profession}
                onChange={handleFilterChange}
                placeholder="Buscar por profesión"
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
          <h5 className="text-orange mb-3">
            Resultados: {results.length} instructor(es) encontrado(s)
          </h5>
          {results.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover variant="dark" className="text-white">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>CI</th>
                    <th>Profesión</th>
                    <th>Cursos</th>
                    <th>Email</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((instructor) => (
                    <tr key={instructor._id}>
                      <td>
                        <i
                          className="bi bi-clipboard cursor-pointer text-orange"
                          title={instructor._id}
                          onClick={() => handleCopyId(instructor._id)}
                          style={{ cursor: "pointer", fontSize: "1.2rem" }}
                        ></i>
                      </td>
                      <td>{instructor.firstName || "N/A"}</td>
                      <td>{instructor.lastName || "N/A"}</td>
                      <td>{instructor.ci || "N/A"}</td>
                      <td>{instructor.profession || "N/A"}</td>
                      <td>{instructor.courses?.length || 0}</td>
                      <td>{instructor.contact?.email || "N/A"}</td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          <span
                            className="action-link"
                            onClick={() => handleUpdateClick(instructor)}
                          >
                            <i className="bi bi-pencil-square me-1"></i>
                            Actualizar
                          </span>
                          <span
                            className="action-link"
                            onClick={() => handleDeleteClick(instructor)}
                          >
                            <i className="bi bi-trash me-1"></i>
                            Eliminar
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center text-white py-4">
              <p>No se encontraron instructores con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      )}

      <Modal show={showDeleteModal} onHide={() => {
        setShowDeleteModal(false);
        setInstructorToDelete(null);
        setConfirmText("");
      }} className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-white">
            ¿Estás seguro de que deseas eliminar al instructor <strong>{instructorToDelete?.firstName} {instructorToDelete?.lastName}</strong>?
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
            setInstructorToDelete(null);
            setConfirmText("");
          }}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteInstructor}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
