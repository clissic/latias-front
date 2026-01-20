import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function ActualizarEvento({ event }) {
  const [eventData, setEventData] = useState({
    eventId: "",
    title: "",
    date: "",
    hour: "",
    price: 0,
    currency: "USD",
    description: "",
    image: "",
    tickets: {
      availableTickets: 0,
      soldTickets: 0,
      remainingTickets: 0
    },
    location: {
      city: "",
      country: "",
      address: ""
    },
    speaker: {
      firstName: "",
      lastName: "",
      ci: "",
      profession: "",
      position: ""
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Precargar datos cuando event cambie
  useEffect(() => {
    if (event) {
      // Formatear fecha para input type="date"
      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      // Formatear hora para input type="time"
      const formatTimeForInput = (timeString) => {
        if (!timeString) return "";
        // Si ya está en formato HH:MM, devolverlo
        if (timeString.match(/^\d{2}:\d{2}$/)) {
          return timeString;
        }
        return timeString;
      };

      setEventData({
        eventId: event.eventId || "",
        title: event.title || "",
        date: formatDateForInput(event.date),
        hour: formatTimeForInput(event.hour),
        price: event.price || 0,
        currency: event.currency || "USD",
        description: event.description || "",
        tickets: {
          availableTickets: event.tickets?.availableTickets || 0,
          soldTickets: event.tickets?.soldTickets || 0,
          remainingTickets: event.tickets?.remainingTickets || 0
        },
        location: {
          city: event.location?.city || "",
          country: event.location?.country || "",
          address: event.location?.address || ""
        },
        speaker: {
          firstName: event.speaker?.firstName || "",
          lastName: event.speaker?.lastName || "",
          ci: event.speaker?.ci || "",
          profession: event.speaker?.profession || "",
          position: event.speaker?.position || ""
        },
        active: event.active !== undefined ? event.active : true
      });
    }
  }, [event]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("tickets.")) {
      const ticketField = name.split(".")[1];
      setEventData(prev => {
        const newTickets = {
          ...prev.tickets,
          [ticketField]: type === "number" ? (value === "" ? 0 : parseFloat(value) || 0) : value
        };
        
        // Recalcular remainingTickets si cambia availableTickets o soldTickets
        if (ticketField === "availableTickets" || ticketField === "soldTickets") {
          newTickets.remainingTickets = newTickets.availableTickets - newTickets.soldTickets;
        }
        
        return {
          ...prev,
          tickets: newTickets
        };
      });
    } else if (name.startsWith("location.")) {
      const locationField = name.split(".")[1];
      setEventData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else if (name.startsWith("speaker.")) {
      const speakerField = name.split(".")[1];
      setEventData(prev => ({
        ...prev,
        speaker: {
          ...prev.speaker,
          [speakerField]: value
        }
      }));
    } else {
      const processedValue = type === "checkbox" ? checked : (type === "number" ? (value === "" ? 0 : parseFloat(value) || 0) : value);
      setEventData(prev => ({
        ...prev,
        [name]: processedValue
      }));
    }
  };

  // Manejar cambios en archivo de imagen
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Por favor selecciona un archivo de imagen válido",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "La imagen no debe superar los 5MB",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        return;
      }

      // Guardar el archivo
      setImageFile(file);

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar imagen
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(event?.image || "");
    setEventData(prev => ({
      ...prev,
      image: event?.image || ""
    }));
    const fileInput = document.querySelector('input[type="file"][name="image"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!event || !event.eventId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el evento a actualizar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      // Subir imagen si hay una nueva
      let uploadedImagePath = eventData.image;
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        const uploadResponse = await apiService.uploadEventImage(formData);
        if (uploadResponse.status === "success") {
          uploadedImagePath = uploadResponse.payload.image;
        } else {
          throw new Error(uploadResponse.msg || "Error al subir la imagen");
        }
      }

      // Asegurar que remainingTickets esté calculado correctamente
      const finalEventData = {
        ...eventData,
        image: uploadedImagePath,
        tickets: {
          ...eventData.tickets,
          remainingTickets: eventData.tickets.availableTickets - eventData.tickets.soldTickets
        }
      };

      const response = await apiService.updateEvent(event.eventId, finalEventData);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Evento actualizado",
          text: response.msg || "El evento se ha actualizado exitosamente",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      } else {
        throw new Error(response.msg || "Error al actualizar el evento");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al actualizar el evento",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="text-white">
        <p>No se encontró el evento para actualizar.</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="crear-curso-form">
      <div className="form-section">
        <h5 className="text-orange mb-3">Datos básicos del evento:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Event ID *</Form.Label>
            <Form.Control
              type="text"
              name="eventId"
              value={eventData.eventId}
              onChange={handleChange}
              required
              disabled
            />
            <Form.Text className="text-muted">El Event ID no se puede modificar</Form.Text>
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Título *</Form.Label>
            <Form.Control
              type="text"
              name="title"
              value={eventData.title}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Fecha *</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={eventData.date}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Hora *</Form.Label>
            <Form.Control
              type="time"
              name="hour"
              value={eventData.hour}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              name="price"
              value={eventData.price}
              onChange={handleChange}
              min="0"
              step="0.01"
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Moneda</Form.Label>
            <Form.Select
              name="currency"
              value={eventData.currency}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="UYU">UYU</option>
              <option value="EUR">EUR</option>
              <option value="ARS">ARS</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="description"
              value={eventData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label>Imagen del evento</Form.Label>
            <Form.Control
              type="file"
              name="image"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleImageChange}
            />
            <Form.Text className="text-muted">
              Formatos aceptados: JPG, PNG, GIF, WEBP. Tamaño recomendado: 500x500px. Tamaño máximo: 5MB.
            </Form.Text>
            {imagePreview && (
              <div className="mt-3 position-relative" style={{ maxWidth: "300px" }}>
                <img
                  src={imagePreview.startsWith('data:') || imagePreview.startsWith('http') ? imagePreview : `${window.location.origin}${imagePreview}`}
                  alt="Preview"
                  className="img-thumbnail"
                  style={{ width: "100%", height: "auto" }}
                />
                <button
                  type="button"
                  className="btn btn-danger btn-sm position-absolute top-0 end-0 m-2"
                  onClick={removeImage}
                  style={{ zIndex: 10 }}
                >
                  <i className="bi bi-x"></i>
                </button>
              </div>
            )}
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Tickets:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-4">
            <Form.Label>Tickets Disponibles *</Form.Label>
            <Form.Control
              type="number"
              name="tickets.availableTickets"
              value={eventData.tickets.availableTickets}
              onChange={handleChange}
              min="0"
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Tickets Vendidos</Form.Label>
            <Form.Control
              type="number"
              name="tickets.soldTickets"
              value={eventData.tickets.soldTickets}
              onChange={handleChange}
              min="0"
            />
            <Form.Text className="text-muted">Actualizar si es necesario</Form.Text>
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Tickets Restantes</Form.Label>
            <Form.Control
              type="number"
              name="tickets.remainingTickets"
              value={eventData.tickets.remainingTickets}
              onChange={handleChange}
              min="0"
              disabled
            />
            <Form.Text className="text-muted">Se calcula automáticamente</Form.Text>
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Ubicación:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-4">
            <Form.Label>Ciudad</Form.Label>
            <Form.Control
              type="text"
              name="location.city"
              value={eventData.location.city}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>País</Form.Label>
            <Form.Control
              type="text"
              name="location.country"
              value={eventData.location.country}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Dirección</Form.Label>
            <Form.Control
              type="text"
              name="location.address"
              value={eventData.location.address}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Orador:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-4">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="speaker.firstName"
              value={eventData.speaker.firstName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="speaker.lastName"
              value={eventData.speaker.lastName}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>CI</Form.Label>
            <Form.Control
              type="text"
              name="speaker.ci"
              value={eventData.speaker.ci}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Profesión</Form.Label>
            <Form.Control
              type="text"
              name="speaker.profession"
              value={eventData.speaker.profession}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Posición</Form.Label>
            <Form.Control
              type="text"
              name="speaker.position"
              value={eventData.speaker.position}
              onChange={handleChange}
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section mt-4">
        <div className="div-border-color my-3"></div>
        <div className="d-flex justify-content-end">
          <Button variant="warning" type="submit" size="lg" className="px-5" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: "1em", height: "1em", borderWidth: "0.15em", borderColor: "#082b55", borderRightColor: "transparent" }}></span>
                PROCESANDO...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i> ACTUALIZAR
              </>
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
