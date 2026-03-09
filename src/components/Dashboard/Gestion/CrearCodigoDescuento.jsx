import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function CrearCodigoDescuento() {
  const [formData, setFormData] = useState({
    code: "",
    percentage: "",
    description: "",
    quantity: "1",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "El código es obligatorio",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }
    const percentage = Number(formData.percentage);
    if (formData.percentage === "" || isNaN(percentage) || percentage < 0 || percentage > 100) {
      Swal.fire({
        icon: "warning",
        title: "Porcentaje inválido",
        text: "El porcentaje debe ser un número entre 0 y 100",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }
    if (!formData.description.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campo requerido",
        text: "La descripción es obligatoria",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }
    const quantity = parseInt(formData.quantity, 10);
    if (formData.quantity === "" || isNaN(quantity) || quantity < 0) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad de usos inválida",
        text: "Indica cuántas veces se podrá usar el código (entero mayor o igual a 0).",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.createDiscountCode({
        code: formData.code.trim(),
        percentage,
        description: formData.description.trim(),
        quantity,
      });
      if (res.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Código creado",
          text: "El código de descuento se creó correctamente.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
        setFormData({ code: "", percentage: "", description: "", quantity: "1" });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.msg || "No se pudo crear el código",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err?.message || "Error al crear el código de descuento",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="gestion-form">
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Código</Form.Label>
        <Form.Control
          type="text"
          name="code"
          value={formData.code}
          onChange={handleChange}
          placeholder="Ej: NAVIDAD2025"
          maxLength={50}
          className="bg-dark text-white border-secondary"
        />
        <Form.Text className="text-white-50">El usuario ingresará este código al pagar. Se guardará en mayúsculas.</Form.Text>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Porcentaje de descuento (%)</Form.Label>
        <Form.Control
          type="number"
          name="percentage"
          value={formData.percentage}
          onChange={handleChange}
          placeholder="Ej: 15"
          min={0}
          max={100}
          step={0.01}
          className="bg-dark text-white border-secondary"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Cantidad de usos permitidos</Form.Label>
        <Form.Control
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Ej: 100"
          min={0}
          step={1}
          className="bg-dark text-white border-secondary"
        />
        <Form.Text className="text-white-50">Número fijo de veces que se podrá usar este código en total. Los usos se cuentan por el número de usuarios que lo aplican (cada usuario solo puede usarlo una vez).</Form.Text>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ej: Descuento por festividad de Navidad 2025, o promoción con creador de contenido X."
          className="bg-dark text-white border-secondary"
        />
        <Form.Text className="text-white-50">Explica el motivo del código (festividad, creador de contenido, etc.).</Form.Text>
      </Form.Group>
      <div className="d-flex justify-content-end">
        <Button type="submit" variant="warning" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Creando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle-fill me-2"></i> CREAR CÓDIGO
            </>
          )}
        </Button>
      </div>
    </Form>
  );
}
