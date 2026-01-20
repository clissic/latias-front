import React, { useState, useEffect } from "react";
import { FadeIn } from "../../FadeIn/FadeIn";
import { apiService } from "../../../services/apiService";
import Swal from "sweetalert2";
import "./Eventos.css";

export function Eventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingEventId, setProcessingEventId] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await apiService.getActiveEvents();
        if (response.status === "success" && response.payload) {
          setEventos(response.payload);
        } else {
          setError("No se pudieron cargar los eventos");
        }
      } catch (err) {
        console.error("Error al cargar eventos:", err);
        setError("Error al cargar los eventos");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
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

  // Función para formatear el orador
  const formatSpeaker = (speaker) => {
    if (!speaker) return "No especificado";
    const firstName = speaker.firstName || "";
    const lastName = speaker.lastName || "";
    const name = firstName && lastName ? `${firstName} ${lastName}` : (firstName || lastName || "");
    const profession = speaker.profession || speaker.position || "";
    if (name && profession) {
      return `${name}, ${profession}`;
    }
    return name || profession || "No especificado";
  };

  // Función para obtener el símbolo de moneda
  const getCurrencySymbol = (currencyCode) => {
    const currencySymbols = {
      'USD': '$',
      'UYU': '$U',
      'EUR': '€',
      'ARS': '$',
      'BRL': 'R$',
      'MXN': '$',
      'CLP': '$',
      'COP': '$',
      'PEN': 'S/',
      'PYG': '₲'
    };
    return currencySymbols[currencyCode?.toUpperCase()] || '$';
  };

  // Función para formatear el precio (igual que en CartaCurso)
  const formatPrice = (price, currency) => {
    const courseCurrency = currency || 'USD';
    const currencySymbol = getCurrencySymbol(courseCurrency);
    return (
      <>
        <span >{currencySymbol} </span>
        <span >{price}<span>.00</span> </span>
        <span >{courseCurrency}</span>
      </>
    );
  };

  // Función para manejar la compra de tickets
  const handlePurchaseTicket = async (evento) => {
    try {
      const result = await Swal.fire({
        title: "Confirmar asistencia",
        html: `
          <p>¿Deseas agendar asistencia a <strong>${evento.title}</strong>?</p>
          ${evento.price > 0 ? `<p>Precio: <strong>${getCurrencySymbol(evento.currency || "USD")} ${evento.price}.00 ${evento.currency || "USD"}</strong></p>` : ""}
          ${evento.tickets && evento.tickets.remainingTickets > 0 
            ? `<p>Tickets disponibles: <strong>${evento.tickets.remainingTickets}</strong></p>` 
            : "<p class='text-danger'><strong>No hay tickets disponibles</strong></p>"}
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Confirmar",
        cancelButtonText: "Cancelar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });

      if (result.isConfirmed) {
        if (evento.tickets && evento.tickets.remainingTickets <= 0) {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "No hay tickets disponibles para este evento",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
          return;
        }

        // Activar spinner de carga en el botón
        setProcessingEventId(evento.eventId || evento._id);

        const response = await apiService.purchaseEventTicket(evento.eventId, 1);
        
        if (response.status === "success") {
          const ticketId = response.payload?.ticketId;
          Swal.fire({
            icon: "success",
            title: "¡Asistencia confirmada!",
            html: ticketId 
              ? `<p>Tu asistencia al evento ha sido registrada exitosamente.</p><p><strong>ID del Ticket:</strong> ${ticketId}</p><p>Se ha enviado un email con tu ticket y código QR a tu correo electrónico.</p>`
              : "Tu asistencia al evento ha sido registrada exitosamente",
            confirmButtonText: "Aceptar",
            background: "#082b55",
            color: "#ffffff",
            customClass: {
              confirmButton: "custom-swal-button",
            },
          });
          
          // Recargar eventos para actualizar los tickets disponibles
          const updatedResponse = await apiService.getActiveEvents();
          if (updatedResponse.status === "success" && updatedResponse.payload) {
            setEventos(updatedResponse.payload);
          }
        } else {
          throw new Error(response.msg || "Error al confirmar asistencia");
        }
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al confirmar la asistencia",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      // Desactivar spinner de carga
      setProcessingEventId(null);
    }
  };

  if (loading) {
    return (
      <FadeIn>
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-center container">
          <div className="spinner-border text-orange" role="status">
            <span className="visually-hidden">Cargando eventos...</span>
          </div>
        </div>
      </FadeIn>
    );
  }

  if (error) {
    return (
      <FadeIn>
        <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-center container">
          <p className="text-danger">{error}</p>
        </div>
      </FadeIn>
    );
  }

  return (
    <FadeIn>
      <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
        <div className="col-12">
          <h2 className="mb-3 text-orange">Eventos:</h2>
          <div className="div-border-color my-4"></div>
        </div>
        <div className="col-12 d-flex flex-column gap-4">
          {eventos.length === 0 ? (
            <div className="text-center my-5 d-flex flex-column align-items-center col-11">
              <i className="bi bi-binoculars-fill mb-4 custom-display-1 text-orange"></i>
              <h3>¡No hay eventos próximos!</h3>
              <p className="fst-italic">
                ¡Estamos a la espera de que te animes a participar en uno!
              </p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-4">
              {eventos.map((evento) => (
                <div
                  key={evento._id || evento.eventId}
                  className="dashboard-item-build-eventos container d-flex flex-column flex-lg-row gap-4 align-items-start"
                >
                  {/* Columna izquierda: Imagen y botón Agendar */}
                  <div className="col-12 col-lg-3 d-flex flex-column align-items-center gap-3">
                    <div className="event-image-container">
                      {evento.image ? (
                        <img
                          src={evento.image.startsWith('http') ? evento.image : `${window.location.origin}${evento.image}`}
                          alt={evento.title}
                          className="event-image"
                        />
                      ) : (
                        <div className="event-image-placeholder d-flex align-items-center justify-content-center">
                          <i className="bi bi-calendar2-event-fill text-orange" style={{ fontSize: "4rem" }}></i>
                        </div>
                      )}
                    </div>
                    <button 
                      className="btn btn-warning w-100"
                      onClick={() => handlePurchaseTicket(evento)}
                      disabled={
                        (evento.tickets && evento.tickets.remainingTickets <= 0) || 
                        processingEventId === (evento.eventId || evento._id)
                      }
                    >
                      {processingEventId === (evento.eventId || evento._id) ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: "1em", height: "1em", borderWidth: "0.15em" }}></span>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-calendar-check-fill me-2"></i>
                          {evento.tickets && evento.tickets.remainingTickets <= 0 ? "Agotado" : "Agendar"}
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Columna derecha: Datos del evento */}
                  <div className="col-12 col-lg-9">
                    <h3 className="text-orange mb-3">{evento.title}</h3>
                    {evento.description && (
                      <h6 className="my-2 mb-3">{evento.description}</h6>
                    )}
                    <div className="event-details">
                      <p className="m-2">
                        <i className="bi bi-calendar3 me-2 text-orange"></i>
                        Fecha: <strong>{formatDate(evento.date)}</strong>
                      </p>
                      <p className="m-2">
                        <i className="bi bi-clock me-2 text-orange"></i>
                        Hora: <strong>{evento.hour || "No especificada"}</strong>
                      </p>
                      <p className="m-2">
                        <i className="bi bi-geo-alt me-2 text-orange"></i>
                        Ubicación: <strong>{formatLocation(evento.location)}</strong>
                      </p>
                      <p className="m-2">
                        <i className="bi bi-person-badge me-2 text-orange"></i>
                        Orador: <strong>{formatSpeaker(evento.speaker)}</strong>
                      </p>
                      {evento.price > 0 && (
                        <p className="m-2">
                          <i className="bi bi-currency-dollar me-2 text-orange"></i>
                          Precio: <strong>{formatPrice(evento.price, evento.currency || "USD")}</strong>
                        </p>
                      )}
                      {evento.tickets && (
                        <p className="m-2">
                          <i className="bi bi-ticket-perforated me-2 text-orange"></i>
                          Tickets disponibles: <strong>{evento.tickets.remainingTickets} / {evento.tickets.availableTickets}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}
