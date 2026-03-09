import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function ActualizarCodigoDescuento({ discountCode }) {
  const [formData, setFormData] = useState({
    code: "",
    percentage: "",
    description: "",
    quantity: "1",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (discountCode) {
      setFormData({
        code: discountCode.code || "",
        percentage: discountCode.percentage != null ? String(discountCode.percentage) : "",
        description: discountCode.description || "",
        quantity: discountCode.quantity != null ? String(discountCode.quantity) : "1",
      });
    }
  }, [discountCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!discountCode?._id) return;
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
    const usedCount = Array.isArray(discountCode.usedBy) ? discountCode.usedBy.length : 0;
    if (formData.quantity === "" || isNaN(quantity) || quantity < 0) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad de usos inválida",
        text: "La cantidad debe ser un entero mayor o igual a 0.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }
    if (quantity < usedCount) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad insuficiente",
        text: `Ya se ha usado ${usedCount} vez/veces. La cantidad no puede ser menor.`,
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.updateDiscountCode(discountCode._id, {
        code: formData.code.trim(),
        percentage,
        description: formData.description.trim(),
        quantity,
      });
      if (res.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Código actualizado",
          text: "El código de descuento se actualizó correctamente.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: res.msg || "No se pudo actualizar el código",
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
        text: err?.message || "Error al actualizar el código de descuento",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!discountCode) {
    return (
      <p className="text-white">Busca un código y haz clic en &quot;Actualizar&quot; para cargar sus datos aquí.</p>
    );
  }

  const usedCount = Array.isArray(discountCode.usedBy) ? discountCode.usedBy.length : 0;
  const totalQuantity = discountCode.quantity != null ? discountCode.quantity : 0;

  return (
    <Form onSubmit={handleSubmit} className="gestion-form">
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Usos realizados / Estado</Form.Label>
        <Form.Text className="d-block text-white-50 mb-2">
          {usedCount} / {totalQuantity} usos. Estado: <span className={discountCode.isActive !== false ? "text-success" : "text-secondary"}>{discountCode.isActive !== false ? "Activo" : "Inactivo"}</span> (se desactiva cuando los usos llegan al límite).
        </Form.Text>
      </Form.Group>
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
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Porcentaje de descuento (%)</Form.Label>
        <Form.Control
          type="number"
          name="percentage"
          value={formData.percentage}
          onChange={handleChange}
          min={0}
          max={100}
          step={0.01}
          className="bg-dark text-white border-secondary"
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Cantidad de usos permitidos (número fijo)</Form.Label>
        <Form.Control
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min={Math.max(0, usedCount)}
          step={1}
          className="bg-dark text-white border-secondary"
        />
        <Form.Text className="text-white-50">No puede ser menor a los usos ya realizados ({usedCount}).</Form.Text>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label className="text-white">Descripción</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Ej: Descuento por festividad..."
          className="bg-dark text-white border-secondary"
        />
      </Form.Group>
      <div className="d-flex justify-content-end">
        <Button type="submit" variant="warning" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Guardando...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle-fill me-2"></i> Guardar cambios
            </>
          )}
        </Button>
      </div>
    </Form>
  );
}
