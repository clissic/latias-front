import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Pagination } from "react-bootstrap";
import { apiService } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import { FadeIn } from "../FadeIn/FadeIn";
import "./Checkin.css";

export function Checkin() {
  const [ticketId, setTicketId] = useState("");
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true); // Control de actualización automática
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;
  const logsHeaderRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Cargar logs al montar
  useEffect(() => {
    loadLogs();
  }, []);

  // Actualización automática cada 5 segundos solo si está activada
  useEffect(() => {
    if (!autoUpdate) return;
    
    const interval = setInterval(loadLogs, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, [autoUpdate]);

  // Resetear a página 1 cuando se cargan nuevos logs
  useEffect(() => {
    if (logs.length > 0) {
      setCurrentPage(1);
    }
  }, [logs.length]);

  const loadLogs = async () => {
    try {
      const response = await apiService.getTicketLogsCheckin(200);
      if (response.status === "success") {
        setLogs(response.payload || []);
      }
    } catch (error) {
      console.error("Error al cargar logs:", error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const handleVerifyTicket = async (e) => {
    e.preventDefault();
    
    if (!ticketId.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo vacío",
        text: "Por favor ingresa un ID de ticket",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.verifyTicketCheckin(ticketId.trim());
      
      if (response.status === "success") {
        const { payload } = response;
        
        // Mostrar mensaje según el resultado
        if (payload.processed) {
          Swal.fire({
            icon: "success",
            title: "Ticket procesado",
            text: response.msg || "Ticket válido y procesado correctamente",
            timer: 2000,
            showConfirmButton: false,
            background: "#082b55",
            color: "#ffffff",
          });
        } else if (payload.person?.available === false) {
          Swal.fire({
            icon: "warning",
            title: "Ticket ya utilizado",
            text: response.msg || "Este ticket ya fue utilizado anteriormente",
            timer: 2000,
            showConfirmButton: false,
            background: "#082b55",
            color: "#ffffff",
          });
        } else {
          Swal.fire({
            icon: "info",
            title: "Ticket válido",
            text: response.msg || "Ticket verificado",
            timer: 2000,
            showConfirmButton: false,
            background: "#082b55",
            color: "#ffffff",
          });
        }

        // Recargar logs para mostrar el nuevo movimiento (sin forzar scroll)
        await loadLogs();
        
        // Limpiar el input
        setTicketId("");
      } else {
        // Ticket inválido o error - el log ya fue creado en el backend
        Swal.fire({
          icon: "error",
          title: "Ticket inválido",
          text: response.msg || "Ticket no encontrado o inválido",
          timer: 2000,
          showConfirmButton: false,
          background: "#082b55",
          color: "#ffffff",
        });

        // Recargar logs para mostrar el nuevo movimiento de ticket inválido
        await loadLogs();
        
        // Limpiar el input
        setTicketId("");
      }
    } catch (error) {
      console.error("Error al verificar ticket:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al verificar el ticket",
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

  // Calcular paginación
  const totalPages = Math.ceil(logs.length / logsPerPage);
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = useMemo(() => {
    return logs.slice(indexOfFirstLog, indexOfLastLog);
  }, [logs, currentPage, logsPerPage]);

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
    if (logsHeaderRef.current) {
      logsHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      logout();
      navigate("/login", { replace: true });
    }
  };

  return (
    <FadeIn>
      <div className="checkin-container">
        <div className="checkin-header">
          <i className="bi bi-qr-code-scan text-orange display-2"></i>
          <h2 className="text-white my-4">
            Sistema de Check-in
          </h2>
          <p className="text-white-50 mb-4">
            Ingresa el ID del ticket para verificar y procesar
          </p>
        </div>

        <div className="checkin-form-container">
          <form onSubmit={handleVerifyTicket} className="checkin-form">
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Ingresa el ID del ticket (ej: TKT-XXXXXXXX)"
                value={ticketId}
                onChange={(e) => setTicketId(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                className="btn btn-orange-custom"
                disabled={loading || !ticketId.trim()}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                      style={{ width: "1em", height: "1em", borderWidth: "0.15em" }}
                    ></span>
                    Verificando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle-fill me-2"></i>
                    Verificar Ticket
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="checkin-logs-container">
          <div className="checkin-logs-header" ref={logsHeaderRef}>
            <h4 className="text-orange mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Registro de Movimientos
            </h4>
            <div className="checkin-logs-controls">
              <div className="auto-update-toggle">
                <label className="toggle-label">
                  <span className="toggle-text">Actualización:</span>
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      id="autoUpdateSwitch"
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                    />
                    <label className="form-check-label text-white" htmlFor="autoUpdateSwitch">
                      {autoUpdate ? "Automática" : "Manual"}
                    </label>
                  </div>
                </label>
              </div>
              {!autoUpdate && (
                <button
                  className="btn btn-sm btn-orange"
                  onClick={loadLogs}
                  disabled={loadingLogs}
                >
                  {loadingLogs ? (
                    <span
                      className="spinner-border spinner-border-sm"
                      role="status"
                      style={{ width: "1em", height: "1em", borderWidth: "0.15em" }}
                    ></span>
                  ) : (
                    <i className="bi bi-arrow-clockwise me-1"></i>
                  )}
                  Actualizar
                </button>
              )}
            </div>
          </div>

          <div className="checkin-logs-content">
            {loadingLogs && logs.length === 0 ? (
              <div className="text-center text-white-50 py-5">
                <div className="spinner-border text-orange" role="status">
                  <span className="visually-hidden">Cargando logs...</span>
                </div>
                <p className="mt-3">Cargando registro de movimientos...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center text-white-50 py-5">
                <i className="bi bi-inbox" style={{ fontSize: "3rem" }}></i>
                <p className="mt-3">No hay movimientos registrados aún</p>
              </div>
            ) : (
              <>
                <div className="logs-list">
                  {currentLogs.map((log, index) => (
                    <div key={log._id || index} className="log-item">
                      <div className="log-header">
                        <div className="log-ticket-info">
                          <strong className="text-orange">Ticket:</strong>{" "}
                          <code>{log.ticketId}</code>
                          {getActionBadge(log.action)}
                        </div>
                        <div className="log-time text-white-50">
                          {formatDateTime(log.timestamp)}
                        </div>
                      </div>
                      <div className="log-body">
                        <div className="log-details">
                          <p className="mb-1">
                            <strong>Evento:</strong> {log.eventTitle} ({log.eventId})
                          </p>
                          <p className="mb-1">
                            <strong>Asistente:</strong> {log.personFirstName}{" "}
                            {log.personLastName} (CI: {log.personCi})
                          </p>
                          <p className="mb-1">
                            <strong>Verificado por:</strong> {log.checkedBy?.firstName}{" "}
                            {log.checkedBy?.lastName} ({log.checkedBy?.email})
                          </p>
                          {log.previousAvailable !== undefined && (
                            <p className="mb-0">
                              <strong>Estado:</strong>{" "}
                              <span
                                className={
                                  log.previousAvailable
                                    ? "text-success"
                                    : "text-warning"
                                }
                              >
                                {log.previousAvailable ? "Disponible" : "Usado"}
                              </span>
                              {" → "}
                              <span
                                className={
                                  log.newAvailable ? "text-success" : "text-danger"
                                }
                              >
                                {log.newAvailable ? "Disponible" : "Usado"}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Paginación */}
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
                      onClick={() => handlePageChange(totalPages || 1)}
                      disabled={currentPage === (totalPages || 1) || totalPages === 0}
                      className="custom-pagination-item"
                    />
                  </Pagination>
                  <div className="ms-3 text-white">
                    <small>
                      Página {currentPage} de {totalPages || 1} ({logs.length} registros)
                    </small>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="checkin-logout-container">
          <button
            className="btn btn-danger"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </FadeIn>
  );
}
