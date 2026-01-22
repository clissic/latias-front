import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FadeIn } from "../FadeIn/FadeIn";
import { apiService } from "../../services/apiService";
import Swal from "sweetalert2";
import "./VerifyTicket.css";

export function VerifyTicket() {
  const { ticketId } = useParams();
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const verifyTicket = async () => {
      if (!ticketId) {
        setError("Ticket ID no proporcionado");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.verifyTicket(ticketId);
        
        if (response.status === "success") {
          setVerification(response.payload);
        } else {
          setError(response.msg || "Ticket no encontrado o inválido");
        }
      } catch (err) {
        console.error("Error al verificar ticket:", err);
        setError("Error al verificar el ticket");
      } finally {
        setLoading(false);
      }
    };

    verifyTicket();
  }, [ticketId]);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para formatear la ubicación
  const formatLocation = (location) => {
    if (!location) return "No especificada";
    if (typeof location === "string") return location;
    if (location.city && location.country) {
      return `${location.city}, ${location.country}`;
    }
    if (location.city) return location.city;
    if (location.address) return location.address;
    return "No especificada";
  };

  if (loading) {
    return (
      <FadeIn>
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-center container mt-5">
          <div className="spinner-border text-orange" role="status">
            <span className="visually-hidden">Verificando ticket...</span>
          </div>
          <p className="mt-3">Verificando autenticidad del ticket...</p>
        </div>
      </FadeIn>
    );
  }

  if (error || !verification) {
    return (
      <FadeIn>
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-center container mt-5">
          <div className="verify-ticket-container">
            <div className="ticket-header-error">
              <i className="bi bi-x-circle-fill" style={{ fontSize: "4rem", color: "#dc3545" }}></i>
              <h2 className="mt-3">Ticket Inválido</h2>
            </div>
            <div className="ticket-body">
              <p className="text-center">{error || "El ticket no fue encontrado o no es válido."}</p>
              <p className="text-center text-muted">Por favor, verifica el ID del ticket e intenta nuevamente.</p>
            </div>
          </div>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-center container mt-5">
        <div className="verify-ticket-container">
          <div className="ticket-header-success">
            <i className="bi bi-check-circle-fill" style={{ fontSize: "4rem", color: "#28a745" }}></i>
            <h2 className="mt-3">Ticket Válido</h2>
            <p className="mt-2">Este ticket ha sido verificado y es auténtico</p>
          </div>

          <div className="ticket-body">
            <div className="ticket-section">
              <h3 className="text-orange mb-3">
                <i className="bi bi-calendar-event-fill me-2"></i>
                Información del Evento
              </h3>
              <div className="ticket-info">
                <p><strong>Evento:</strong> {verification.event.title}</p>
                <p><strong>Fecha:</strong> {formatDate(verification.event.date)}</p>
                <p><strong>Hora:</strong> {verification.event.hour || "No especificada"}</p>
                <p><strong>Ubicación:</strong> {formatLocation(verification.event.location)}</p>
              </div>
            </div>

            <div className="ticket-section">
              <h3 className="text-orange mb-3">
                <i className="bi bi-person-fill me-2"></i>
                Información del Asistente
              </h3>
              <div className="ticket-info">
                <p><strong>Nombre:</strong> {verification.person.firstName} {verification.person.lastName}</p>
                <p><strong>CI:</strong> {verification.person.ci}</p>
                <p><strong>Fecha de Registro:</strong> {formatDate(verification.person.registeredAt)}</p>
              </div>
            </div>

            <div className="ticket-section">
              <h3 className="text-orange mb-3">
                <i className="bi bi-ticket-perforated-fill me-2"></i>
                ID del Ticket
              </h3>
              <div className="ticket-id-display">
                <code>{verification.person.ticketId}</code>
              </div>
            </div>

            <div className="ticket-section">
              <h3 className="text-orange mb-3">
                <i className="bi bi-info-circle-fill me-2"></i>
                Estado del Ticket
              </h3>
              <div className="ticket-info">
                <p>
                  <strong>Estado:</strong>{" "}
                  {verification.available !== undefined && verification.available === false ? (
                    <span className="badge bg-warning text-dark">
                      <i className="bi bi-exclamation-triangle-fill me-1"></i>
                      Ya fue utilizado
                    </span>
                  ) : (
                    <span className="badge bg-success">
                      <i className="bi bi-check-circle-fill me-1"></i>
                      Habilitado
                    </span>
                  )}
                </p>
                {verification.available !== undefined && verification.available === false && (
                  <p className="text-warning mt-2">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Este ticket ya fue utilizado anteriormente y no puede ser usado nuevamente.
                  </p>
                )}
              </div>
            </div>

            <div className="ticket-footer">
              <p className="text-center text-muted">
                <i className="bi bi-shield-check me-2"></i>
                Ticket verificado y autenticado por Latias Academia
              </p>
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
