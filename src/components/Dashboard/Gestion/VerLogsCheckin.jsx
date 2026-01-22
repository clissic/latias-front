import React, { useState, useEffect, useMemo, useRef } from "react";
import { Table, Pagination, Accordion, Form, Button } from "react-bootstrap";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./BuscarCurso.css";

export function VerLogsCheckin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 5;
  const tableHeaderRef = useRef(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    ticketId: "",
    eventId: "",
    assistantFirstName: "",
    assistantLastName: "",
    assistantCi: "",
    checkerFirstName: "",
    checkerLastName: "",
    checkerEmail: "",
    dateFrom: "",
    dateTo: "",
    action: "",
    previousAvailable: "",
    newAvailable: ""
  });

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTicketLogs(500);
      if (response.status === "success") {
        setLogs(response.payload || []);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.msg || "No se pudieron cargar los logs",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Error al cargar logs:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al cargar los logs",
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

  const formatDateTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "validated":
        return <span className="badge bg-success">Validado</span>;
      case "already_used":
        return <span className="badge bg-warning">Ya usado</span>;
      case "invalid":
        return <span className="badge bg-danger">Inválido</span>;
      default:
        return <span className="badge bg-secondary">{action}</span>;
    }
  };

  const handleCopyTicketId = async (ticketId) => {
    try {
      await navigator.clipboard.writeText(ticketId);
      Swal.fire({
        icon: "success",
        title: "Copiado",
        text: "Ticket ID copiado al portapapeles",
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
        text: "No se pudo copiar el Ticket ID",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  // Función para aplicar filtros
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Filtro por ticketId
      if (filters.ticketId && !log.ticketId?.toLowerCase().includes(filters.ticketId.toLowerCase())) {
        return false;
      }

      // Filtro por eventId
      if (filters.eventId && !log.eventId?.toLowerCase().includes(filters.eventId.toLowerCase())) {
        return false;
      }

      // Filtro por asistente
      if (filters.assistantFirstName && !log.personFirstName?.toLowerCase().includes(filters.assistantFirstName.toLowerCase())) {
        return false;
      }
      if (filters.assistantLastName && !log.personLastName?.toLowerCase().includes(filters.assistantLastName.toLowerCase())) {
        return false;
      }
      if (filters.assistantCi && !log.personCi?.toLowerCase().includes(filters.assistantCi.toLowerCase())) {
        return false;
      }

      // Filtro por verificador
      if (filters.checkerFirstName && !log.checkedBy?.firstName?.toLowerCase().includes(filters.checkerFirstName.toLowerCase())) {
        return false;
      }
      if (filters.checkerLastName && !log.checkedBy?.lastName?.toLowerCase().includes(filters.checkerLastName.toLowerCase())) {
        return false;
      }
      if (filters.checkerEmail && !log.checkedBy?.email?.toLowerCase().includes(filters.checkerEmail.toLowerCase())) {
        return false;
      }

      // Filtro por fecha/hora
      if (filters.dateFrom || filters.dateTo) {
        const logDate = new Date(log.timestamp);
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (logDate < fromDate) {
            return false;
          }
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (logDate > toDate) {
            return false;
          }
        }
      }

      // Filtro por acción
      if (filters.action && log.action !== filters.action) {
        return false;
      }

      // Filtro por estado anterior
      if (filters.previousAvailable !== "") {
        const prevAvailable = filters.previousAvailable === "true";
        if (log.previousAvailable !== prevAvailable) {
          return false;
        }
      }

      // Filtro por estado nuevo
      if (filters.newAvailable !== "") {
        const newAvail = filters.newAvailable === "true";
        if (log.newAvailable !== newAvail) {
          return false;
        }
      }

      return true;
    });
  }, [logs, filters]);

  // Calcular paginación con logs filtrados
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // Resetear a página 1 cuando cambian los logs filtrados
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredLogs.length]);

  // Manejar cambios en los filtros
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Limpiar todos los filtros
  const handleClearFilters = () => {
    setFilters({
      ticketId: "",
      eventId: "",
      assistantFirstName: "",
      assistantLastName: "",
      assistantCi: "",
      checkerFirstName: "",
      checkerLastName: "",
      checkerEmail: "",
      dateFrom: "",
      dateTo: "",
      action: "",
      previousAvailable: "",
      newAvailable: ""
    });
  };

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

  if (loading) {
    return (
      <div className="text-center text-white py-5">
        <div className="spinner-border text-orange" role="status">
          <span className="visually-hidden">Cargando logs...</span>
        </div>
        <p className="mt-3">Cargando registro de movimientos...</p>
      </div>
    );
  }

  return (
    <div className="gestionar-mis-cursos-container">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2 gap-md-0">
        <h5 className="text-orange mb-0">Registro de Check-in</h5>
        <button
          className="btn btn-sm btn-outline-orange"
          onClick={loadLogs}
          disabled={loading}
        >
          {loading ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              style={{ width: "1em", height: "1em", borderWidth: "0.15em" }}
            ></span>
          ) : (
            <>
              <i className="bi bi-arrow-clockwise me-1"></i>
              Actualizar
            </>
          )}
        </button>
      </div>

      {/* Acordeón de filtros */}
      <Accordion className="mb-4 gestion-accordion" defaultActiveKey="">
        <Accordion.Item eventKey="filters">
          <Accordion.Header>
            <i className="bi bi-funnel-fill me-2"></i>
            Filtros de búsqueda
          </Accordion.Header>
          <Accordion.Body>
            <div className="row g-3">
              {/* Filtro por Ticket ID */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Ticket ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por ID de ticket"
                    value={filters.ticketId}
                    onChange={(e) => handleFilterChange("ticketId", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  />
                </Form.Group>
              </div>

              {/* Filtro por Event ID */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Event ID</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Buscar por ID de evento"
                    value={filters.eventId}
                    onChange={(e) => handleFilterChange("eventId", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  />
                </Form.Group>
              </div>

              {/* Filtro por Asistente */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Nombre del Asistente</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre"
                    value={filters.assistantFirstName}
                    onChange={(e) => handleFilterChange("assistantFirstName", e.target.value)}
                    className="bg-dark text-white border-secondary mb-2"
                  />
                  <Form.Control
                    type="text"
                    placeholder="Apellido"
                    value={filters.assistantLastName}
                    onChange={(e) => handleFilterChange("assistantLastName", e.target.value)}
                    className="bg-dark text-white border-secondary mb-2"
                  />
                  <Form.Control
                    type="text"
                    placeholder="CI"
                    value={filters.assistantCi}
                    onChange={(e) => handleFilterChange("assistantCi", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  />
                </Form.Group>
              </div>

              {/* Filtro por Verificador */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Verificado por</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nombre"
                    value={filters.checkerFirstName}
                    onChange={(e) => handleFilterChange("checkerFirstName", e.target.value)}
                    className="bg-dark text-white border-secondary mb-2"
                  />
                  <Form.Control
                    type="text"
                    placeholder="Apellido"
                    value={filters.checkerLastName}
                    onChange={(e) => handleFilterChange("checkerLastName", e.target.value)}
                    className="bg-dark text-white border-secondary mb-2"
                  />
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={filters.checkerEmail}
                    onChange={(e) => handleFilterChange("checkerEmail", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  />
                </Form.Group>
              </div>

              {/* Filtro por Fecha/Hora */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Período de tiempo</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    placeholder="Desde"
                    value={filters.dateFrom}
                    onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                    className="bg-dark text-white border-secondary mb-2"
                  />
                  <Form.Control
                    type="datetime-local"
                    placeholder="Hasta"
                    value={filters.dateTo}
                    onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  />
                </Form.Group>
              </div>

              {/* Filtro por Acción */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Acción</Form.Label>
                  <Form.Select
                    value={filters.action}
                    onChange={(e) => handleFilterChange("action", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="">Todas</option>
                    <option value="validated">Validado</option>
                    <option value="already_used">Ya usado</option>
                    <option value="invalid">Inválido</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Filtro por Estado Anterior */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Estado Anterior</Form.Label>
                  <Form.Select
                    value={filters.previousAvailable}
                    onChange={(e) => handleFilterChange("previousAvailable", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="">Todos</option>
                    <option value="true">Disponible</option>
                    <option value="false">Usado</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Filtro por Estado Nuevo */}
              <div className="col-12 col-md-6 col-lg-4">
                <Form.Group>
                  <Form.Label className="text-white">Estado Nuevo</Form.Label>
                  <Form.Select
                    value={filters.newAvailable}
                    onChange={(e) => handleFilterChange("newAvailable", e.target.value)}
                    className="bg-dark text-white border-secondary"
                  >
                    <option value="">Todos</option>
                    <option value="true">Disponible</option>
                    <option value="false">Usado</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Botón limpiar filtros */}
              <div className="col-12">
                <Button
                  variant="outline-warning"
                  onClick={handleClearFilters}
                  className="w-100"
                >
                  <i className="bi bi-x-circle me-2"></i>
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      {logs.length === 0 ? (
        <div className="text-center text-white py-5">
          <i className="bi bi-inbox text-orange" style={{ fontSize: "4rem" }}></i>
          <p className="mt-3">No hay movimientos registrados aún</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center text-white py-5">
          <i className="bi bi-funnel text-orange" style={{ fontSize: "4rem" }}></i>
          <p className="mt-3">No se encontraron registros con los filtros aplicados</p>
          <Button
            variant="outline-warning"
            onClick={handleClearFilters}
            className="mt-3"
          >
            <i className="bi bi-x-circle me-2"></i>
            Limpiar Filtros
          </Button>
        </div>
      ) : (
        <div className="table-responsive" ref={tableHeaderRef}>
          <Table striped bordered hover variant="dark" className="text-white">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Evento</th>
                <th>Asistente</th>
                <th>Verificado por</th>
                <th>Acción</th>
                <th>Estado</th>
                <th>Fecha/Hora</th>
              </tr>
            </thead>
            <tbody>
              {currentLogs.map((log, index) => (
                <tr key={log._id || index}>
                  <td>
                    {log.ticketId ? (
                      <div className="d-flex align-items-center gap-2">
                        <i
                          className="bi bi-clipboard-fill cursor-pointer text-orange"
                          title={log.ticketId}
                          onClick={() => handleCopyTicketId(log.ticketId)}
                          style={{ cursor: "pointer", fontSize: "1.2rem" }}
                        ></i>
                      </div>
                    ) : (
                      <span className="text-truncate d-inline-block" style={{ maxWidth: "100px" }}>
                        N/A
                      </span>
                    )}
                  </td>
                  <td>
                    <div>
                      <strong>{log.eventTitle}</strong>
                      <br />
                      <small className="text-white-50">({log.eventId})</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      {log.personFirstName} {log.personLastName}
                      <br />
                      <small className="text-white-50">CI: {log.personCi}</small>
                    </div>
                  </td>
                  <td>
                    <div>
                      {log.checkedBy?.firstName} {log.checkedBy?.lastName}
                      <br />
                      <small className="text-white-50">{log.checkedBy?.email}</small>
                    </div>
                  </td>
                  <td>{getActionBadge(log.action)}</td>
                  <td>
                    {log.previousAvailable !== undefined && (
                      <div>
                        <span
                          className={
                            log.previousAvailable
                              ? "badge bg-success me-1"
                              : "badge bg-warning me-1"
                          }
                        >
                          {log.previousAvailable ? "Disponible" : "Usado"}
                        </span>
                        <span className="text-white-50">→</span>
                        <span
                          className={
                            log.newAvailable
                              ? "badge bg-success ms-1"
                              : "badge bg-danger ms-1"
                          }
                        >
                          {log.newAvailable ? "Disponible" : "Usado"}
                        </span>
                      </div>
                    )}
                  </td>
                  <td>
                    <small>{formatDateTime(log.timestamp)}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* Información de filtros aplicados */}
      {filteredLogs.length !== logs.length && (
        <div className="alert alert-info mt-3 mb-0" role="alert">
          <i className="bi bi-info-circle me-2"></i>
          Mostrando {filteredLogs.length} de {logs.length} registros
        </div>
      )}

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
              Página {currentPage} de {totalPages} ({filteredLogs.length} registros)
            </small>
          </div>
        )}
      </div>
    </div>
  );
}
