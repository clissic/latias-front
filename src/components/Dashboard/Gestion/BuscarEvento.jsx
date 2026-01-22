import React, { useState, useEffect, useRef } from "react";
import { Form, Button, Table, Modal, Pagination } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./BuscarCurso.css";

export function BuscarEvento({ onUpdateEvent }) {
  const [filters, setFilters] = useState({
    eventId: "",
    title: "",
    date: "",
    city: "",
    country: "",
    active: ""
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
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
      const response = await apiService.getAllEvents();
      
      if (response.status === "success" && response.payload) {
        let filteredEvents = [...response.payload];

        // Aplicar filtros
        if (filters.eventId.trim()) {
          filteredEvents = filteredEvents.filter((event) =>
            event.eventId?.toLowerCase().includes(filters.eventId.toLowerCase())
          );
        }

        if (filters.title.trim()) {
          filteredEvents = filteredEvents.filter((event) =>
            event.title?.toLowerCase().includes(filters.title.toLowerCase())
          );
        }

        if (filters.date) {
          const filterDate = new Date(filters.date);
          filterDate.setHours(0, 0, 0, 0);
          filteredEvents = filteredEvents.filter((event) => {
            const eventDate = new Date(event.date);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === filterDate.getTime();
          });
        }

        if (filters.city.trim()) {
          filteredEvents = filteredEvents.filter((event) =>
            event.location?.city?.toLowerCase().includes(filters.city.toLowerCase())
          );
        }

        if (filters.country.trim()) {
          filteredEvents = filteredEvents.filter((event) =>
            event.location?.country?.toLowerCase().includes(filters.country.toLowerCase())
          );
        }

        if (filters.active !== "") {
          const isActive = filters.active === "true";
          filteredEvents = filteredEvents.filter((event) => event.active === isActive);
        }

        setResults(filteredEvents);
        setSearched(true);

        if (filteredEvents.length === 0) {
          Swal.fire({
            icon: "info",
            title: "Sin resultados",
            text: "No se encontraron eventos con los filtros seleccionados",
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
          text: "No se pudieron obtener los eventos",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Error al buscar eventos:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al buscar los eventos",
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
      eventId: "",
      title: "",
      date: "",
      city: "",
      country: "",
      active: ""
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

  const handleCopyEventId = async (eventId) => {
    try {
      await navigator.clipboard.writeText(eventId);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "Event ID copiado al portapapeles",
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
        text: "No se pudo copiar el Event ID",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  const handleUpdateClick = (event) => {
    if (onUpdateEvent) {
      onUpdateEvent(event);
    }
  };

  const handleDeleteClick = (event) => {
    setEventToDelete(event);
    setConfirmText("");
    setShowDeleteModal(true);
  };

  const handleDeleteEvent = async () => {
    if (confirmText === "eliminar") {
      try {
        const response = await apiService.deleteEvent(eventToDelete.eventId);
        if (response.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Evento eliminado",
            text: response.msg || "El evento ha sido eliminado correctamente.",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          }).then(() => {
            setShowDeleteModal(false);
            setEventToDelete(null);
            setConfirmText("");
            setResults(results.filter(event => event.eventId !== eventToDelete.eventId));
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: response.msg || "No se pudo eliminar el evento.",
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
          text: "Hubo un problema al eliminar el evento.",
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatLocation = (location) => {
    if (!location) return "N/A";
    if (typeof location === "string") return location;
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    if (location.city) return location.city;
    if (location.address) return location.address;
    return "N/A";
  };

  const formatSpeaker = (speaker) => {
    if (!speaker) return "N/A";
    const firstName = speaker.firstName || "";
    const lastName = speaker.lastName || "";
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return firstName || lastName || "N/A";
  };

  return (
    <div className="buscar-curso-container">
      <div className="filters-section mb-4">
        <h5 className="text-orange mb-3">Filtros de búsqueda:</h5>
        <Form>
          <div className="row g-3">
            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Event ID:</Form.Label>
              <Form.Control
                type="text"
                name="eventId"
                value={filters.eventId}
                onChange={handleFilterChange}
                placeholder="Buscar por Event ID"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Título:</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                placeholder="Buscar por título"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-4">
              <Form.Label className="text-white">Fecha:</Form.Label>
              <Form.Control
                type="date"
                name="date"
                value={filters.date}
                onChange={handleFilterChange}
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-4">
              <Form.Label className="text-white">Ciudad:</Form.Label>
              <Form.Control
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Buscar por ciudad"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-4">
              <Form.Label className="text-white">País:</Form.Label>
              <Form.Control
                type="text"
                name="country"
                value={filters.country}
                onChange={handleFilterChange}
                placeholder="Buscar por país"
                className="bg-dark text-white border-secondary"
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label className="text-white">Estado:</Form.Label>
              <Form.Select
                name="active"
                value={filters.active}
                onChange={handleFilterChange}
                className="bg-dark text-white border-secondary"
              >
                <option value="">Todos</option>
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </Form.Select>
            </Form.Group>
          </div>

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="warning"
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
                  Buscar
                </>
              )}
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              Limpiar
            </Button>
          </div>
        </Form>
      </div>

      {searched && results.length > 0 && (
        <div className="results-section">
          <h5 className="text-orange mb-3" ref={tableHeaderRef}>Resultados ({results.length}):</h5>
          <>
            <div className="table-responsive">
              <Table striped bordered hover variant="dark" className="table-dark">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Ubicación</th>
                    <th>Orador</th>
                    <th>Precio</th>
                    <th>Tickets</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {currentResults.map((event) => (
                  <tr key={event._id || event.eventId}>
                    <td>
                      <i
                        className="bi bi-clipboard-fill cursor-pointer"
                        onClick={() => handleCopyEventId(event.eventId)}
                        title="Copiar Event ID"
                        style={{ fontSize: "1.2rem", color: "#ffa500" }}
                      ></i>
                    </td>
                    <td>{event.title}</td>
                    <td>{formatDate(event.date)}</td>
                    <td>{event.hour || "N/A"}</td>
                    <td>{formatLocation(event.location)}</td>
                    <td>{formatSpeaker(event.speaker)}</td>
                    <td>
                      {event.price > 0 
                        ? `${event.price} ${event.currency || "USD"}` 
                        : "Gratis"}
                    </td>
                    <td>
                      {event.tickets 
                        ? `${event.tickets.remainingTickets} / ${event.tickets.availableTickets}`
                        : "N/A"}
                    </td>
                    <td>
                      <span className={`badge ${event.active ? "bg-success" : "bg-secondary"}`}>
                        {event.active ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <span
                          className="action-link"
                          onClick={() => handleUpdateClick(event)}
                          style={{ cursor: "pointer" }}
                        >
                          Actualizar
                        </span>
                        <span
                          className="action-link text-danger"
                          onClick={() => handleDeleteClick(event)}
                          style={{ cursor: "pointer" }}
                        >
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
              {totalPages > 0 && (
                <div className="ms-3 text-white">
                  <small>
                    Página {currentPage} de {totalPages} ({results.length} registros)
                  </small>
                </div>
              )}
            </div>
          </>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton style={{ background: "#082b55", color: "#ffffff" }}>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: "#082b55", color: "#ffffff" }}>
          <p>¿Estás seguro de que deseas eliminar el evento <strong>{eventToDelete?.title}</strong>?</p>
          <p className="text-danger">Esta acción no se puede deshacer.</p>
          <Form.Group className="mt-3">
            <Form.Label>Escribe "eliminar" para confirmar:</Form.Label>
            <Form.Control
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="eliminar"
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ background: "#082b55", color: "#ffffff" }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleDeleteEvent}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
