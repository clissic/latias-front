import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function CrearEvento() {
  const [eventData, setEventData] = useState({
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

  // Estado para el archivo de imagen
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("tickets.")) {
      const ticketField = name.split(".")[1];
      setEventData(prev => ({
        ...prev,
        tickets: {
          ...prev.tickets,
          [ticketField]: type === "number" ? (value === "" ? 0 : parseFloat(value) || 0) : value
        }
      }));
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

  // Recalcular remainingTickets cuando cambie availableTickets
  const handleAvailableTicketsChange = (e) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
    setEventData(prev => ({
      ...prev,
      tickets: {
        ...prev.tickets,
        availableTickets: value,
        remainingTickets: value - prev.tickets.soldTickets
      }
    }));
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
    setImagePreview("");
    setEventData(prev => ({
      ...prev,
      image: ""
    }));
    const fileInput = document.querySelector('input[type="file"][name="image"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!eventData.title || !eventData.date || !eventData.hour) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "Los campos title, date y hour son requeridos",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    if (!eventData.tickets.availableTickets || eventData.tickets.availableTickets <= 0) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: "El número de tickets disponibles debe ser mayor a 0",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    try {
      setIsLoading(true);

      // Subir imagen si hay una
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

      // Asegurar que remainingTickets sea igual a availableTickets al crear
      // No incluir eventId, se genera automáticamente en el backend
      const { eventId, ...eventDataWithoutId } = eventData;
      const finalEventData = {
        ...eventDataWithoutId,
        image: uploadedImagePath,
        tickets: {
          ...eventData.tickets,
          remainingTickets: eventData.tickets.availableTickets,
          soldTickets: 0
        }
      };

      const response = await apiService.createEvent(finalEventData);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Evento creado",
          text: response.msg || "El evento se ha creado exitosamente",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
        
        // Limpiar formulario
        setEventData({
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
        setImageFile(null);
        setImagePreview("");
      } else {
        throw new Error(response.msg || "Error al crear el evento");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al crear el evento",
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

  return (
    <Form onSubmit={handleSubmit} className="crear-curso-form">
      <div className="form-section">
        <h5 className="text-orange mb-3">Datos básicos del evento:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
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
                  src={imagePreview}
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
              onChange={handleAvailableTicketsChange}
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
              disabled
            />
            <Form.Text className="text-muted">Se inicializa en 0</Form.Text>
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
          <Button 
            variant="warning" 
            type="submit" 
            size="lg" 
            className="px-5"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: "1em", height: "1em", borderWidth: "0.15em" }}></span>
                CREANDO...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i> CREAR EVENTO
              </>
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
