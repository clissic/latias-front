import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

const INITIAL_DATA = {
  firstName: "",
  lastName: "",
  ci: "",
  profileImage: "",
  profession: "",
  experience: "",
  bio: "",
  certifications: [""],
  achievements: [""],
  courses: [],
  contact: { email: "", phone: "" },
  socialMedia: { linkedin: "", twitter: "", instagram: "", youtube: "" },
};

export function CrearInstructor() {
  const [form, setForm] = useState({ ...INITIAL_DATA });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateContact = (key, value) => {
    setForm((prev) => ({
      ...prev,
      contact: { ...prev.contact, [key]: value },
    }));
  };

  const updateSocial = (key, value) => {
    setForm((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [key]: value },
    }));
  };

  const setCertification = (index, value) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.map((c, i) => (i === index ? value : c)),
    }));
  };
  const addCertification = () => setForm((prev) => ({ ...prev, certifications: [...prev.certifications, ""] }));
  const removeCertification = (index) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const setAchievement = (index, value) => {
    setForm((prev) => ({
      ...prev,
      achievements: prev.achievements.map((a, i) => (i === index ? value : a)),
    }));
  };
  const addAchievement = () => setForm((prev) => ({ ...prev, achievements: [...prev.achievements, ""] }));
  const removeAchievement = (index) => {
    setForm((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index),
    }));
  };

  const addCourse = () => setForm((prev) => ({ ...prev, courses: [...prev.courses, ""] }));
  const setCourse = (index, value) => {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.map((c, i) => (i === index ? value : c)),
    }));
  };
  const removeCourse = (index) => {
    setForm((prev) => ({ ...prev, courses: prev.courses.filter((_, i) => i !== index) }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Error", text: "El archivo debe ser una imagen", confirmButtonText: "Aceptar", background: "#082b55", color: "#ffffff", customClass: { confirmButton: "custom-swal-button" } });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "Error", text: "La imagen no debe superar 5MB", confirmButtonText: "Aceptar", background: "#082b55", color: "#ffffff", customClass: { confirmButton: "custom-swal-button" } });
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    update("profileImage", "");
    const input = document.querySelector('input[type="file"][data-image-type="profileImage"]');
    if (input) input.value = "";
  };

  const validate = () => {
    if (!form.firstName?.trim()) return "El nombre es requerido.";
    if (!form.lastName?.trim()) return "El apellido es requerido.";
    const ciNum = parseInt(form.ci, 10);
    if (!form.ci || isNaN(ciNum) || ciNum <= 0) return "El CI debe ser un número válido.";
    if (!form.profession?.trim()) return "La profesión es requerida.";
    if (!form.contact?.email?.trim()) return "El email de contacto es requerido.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      Swal.fire({ icon: "error", title: "Error de validación", text: err, confirmButtonText: "Aceptar", background: "#082b55", color: "#ffffff", customClass: { confirmButton: "custom-swal-button" } });
      return;
    }

    setIsSubmitting(true);
    try {
      let profileImage = form.profileImage || "";
      if (imageFile) {
        const formData = new FormData();
        formData.append("profileImage", imageFile);
        const uploadRes = await apiService.uploadInstructorImage(formData);
        if (uploadRes?.status === "success" && uploadRes?.payload?.profileImage) {
          profileImage = uploadRes.payload.profileImage;
        } else {
          throw new Error(uploadRes?.msg || "Error al subir la imagen");
        }
      }

      const payload = {
        firstName: String(form.firstName).trim(),
        lastName: String(form.lastName).trim(),
        ci: parseInt(form.ci, 10),
        profileImage: String(profileImage),
        profession: String(form.profession).trim(),
        experience: String(form.experience ?? "").trim(),
        bio: String(form.bio ?? "").trim(),
        certifications: form.certifications.filter((c) => String(c).trim() !== "").map((c) => String(c).trim()),
        achievements: form.achievements.filter((a) => String(a).trim() !== "").map((a) => String(a).trim()),
        courses: form.courses.filter((c) => String(c).trim() !== "").map((c) => String(c).trim()),
        contact: {
          email: String(form.contact.email ?? "").trim(),
          phone: String(form.contact.phone ?? "").trim(),
        },
        socialMedia: {
          linkedin: String(form.socialMedia.linkedin ?? "").trim(),
          twitter: String(form.socialMedia.twitter ?? "").trim(),
          instagram: String(form.socialMedia.instagram ?? "").trim(),
          youtube: String(form.socialMedia.youtube ?? "").trim(),
        },
      };

      const response = await apiService.createInstructor(payload);
      if (response?.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Instructor creado",
          text: "El instructor se creó correctamente.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: { confirmButton: "custom-swal-button" },
        });
        setForm(JSON.parse(JSON.stringify(INITIAL_DATA)));
        clearImage();
      } else {
        throw new Error(response?.msg || "Error al crear el instructor");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "No se pudo crear el instructor.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: { confirmButton: "custom-swal-button" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="crear-curso-form">
      <div className="form-section">
        <h5 className="text-orange mb-3">Datos básicos</h5>
        <div className="div-border-color my-3" />
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              maxLength={100}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Apellido *</Form.Label>
            <Form.Control
              type="text"
              value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              maxLength={100}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12 col-md-6">
            <Form.Label>CI (cédula) *</Form.Label>
            <Form.Control
              type="text"
              inputMode="numeric"
              value={form.ci}
              onChange={(e) => update("ci", e.target.value.replace(/\D/g, ""))}
              required
              className="bg-dark text-white border-secondary"
            />
            <Form.Text className="text-muted">Solo números, sin puntos ni guiones.</Form.Text>
          </Form.Group>
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Imagen de perfil</Form.Label>
            <Form.Control type="file" accept="image/*" data-image-type="profileImage" onChange={handleImageChange} className="bg-dark text-white border-secondary" />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  onClick={clearImage}
                  role="button"
                  style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px", cursor: "pointer", border: "2px solid rgba(255,165,0,0.5)" }}
                  title="Clic para quitar"
                />
              </div>
            )}
          </Form.Group>
          <Form.Group className="col-12">
            <Form.Label>Profesión *</Form.Label>
            <Form.Control
              type="text"
              value={form.profession}
              onChange={(e) => update("profession", e.target.value)}
              maxLength={200}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12">
            <Form.Label>Experiencia</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              value={form.experience}
              onChange={(e) => update("experience", e.target.value)}
              maxLength={500}
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12">
            <Form.Label>Biografía</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
              maxLength={1000}
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
          <h5 className="text-orange mb-0">Certificaciones</h5>
          <Button type="button" variant="success" size="sm" onClick={addCertification}>
            <i className="bi bi-plus-circle-fill me-1" /> Agregar
          </Button>
        </div>
        <div className="div-border-color my-3" />
        {form.certifications.map((cert, index) => (
          <div key={index} className="d-flex gap-2 mb-2">
            <Form.Control
              type="text"
              value={cert}
              onChange={(e) => setCertification(index, e.target.value)}
              placeholder="Nombre de la certificación"
              className="bg-dark text-white border-secondary flex-grow-1"
            />
            {form.certifications.length > 1 && (
              <Button type="button" variant="danger" size="sm" onClick={() => removeCertification(index)}>
                <i className="bi bi-trash-fill" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="form-section">
        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
          <h5 className="text-orange mb-0">Logros</h5>
          <Button type="button" variant="success" size="sm" onClick={addAchievement}>
            <i className="bi bi-plus-circle-fill me-1" /> Agregar
          </Button>
        </div>
        <div className="div-border-color my-3" />
        {form.achievements.map((ach, index) => (
          <div key={index} className="d-flex gap-2 mb-2">
            <Form.Control
              type="text"
              value={ach}
              onChange={(e) => setAchievement(index, e.target.value)}
              placeholder="Logro"
              className="bg-dark text-white border-secondary flex-grow-1"
            />
            {form.achievements.length > 1 && (
              <Button type="button" variant="danger" size="sm" onClick={() => removeAchievement(index)}>
                <i className="bi bi-trash-fill" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="form-section">
        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
          <h5 className="text-orange mb-0">Cursos (IDs)</h5>
          <Button type="button" variant="success" size="sm" onClick={addCourse}>
            <i className="bi bi-plus-circle-fill me-1" /> Agregar
          </Button>
        </div>
        <div className="div-border-color my-3" />
        <Form.Text className="text-muted d-block mb-2">Puedes asignar después el curso desde la edición del curso.</Form.Text>
        {form.courses.map((courseId, index) => (
          <div key={index} className="d-flex gap-2 mb-2">
            <Form.Control
              type="text"
              value={courseId}
              onChange={(e) => setCourse(index, e.target.value)}
              placeholder="course_xxx (ID del curso)"
              className="bg-dark text-white border-secondary flex-grow-1"
            />
            <Button type="button" variant="danger" size="sm" onClick={() => removeCourse(index)}>
              <i className="bi bi-trash-fill" />
            </Button>
          </div>
        ))}
      </div>

      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Contacto</h5>
        <div className="div-border-color my-3" />
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              value={form.contact.email}
              onChange={(e) => updateContact("email", e.target.value)}
              maxLength={100}
              required
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              value={form.contact.phone}
              onChange={(e) => updateContact("phone", e.target.value)}
              maxLength={20}
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Redes sociales</h5>
        <div className="div-border-color my-3" />
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>LinkedIn</Form.Label>
            <Form.Control
              type="url"
              value={form.socialMedia.linkedin}
              onChange={(e) => updateSocial("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Twitter</Form.Label>
            <Form.Control
              type="url"
              value={form.socialMedia.twitter}
              onChange={(e) => updateSocial("twitter", e.target.value)}
              placeholder="https://twitter.com/..."
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Instagram</Form.Label>
            <Form.Control
              type="url"
              value={form.socialMedia.instagram}
              onChange={(e) => updateSocial("instagram", e.target.value)}
              placeholder="https://instagram.com/..."
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
          <Form.Group className="col-12 col-md-6">
            <Form.Label>YouTube</Form.Label>
            <Form.Control
              type="url"
              value={form.socialMedia.youtube}
              onChange={(e) => updateSocial("youtube", e.target.value)}
              placeholder="https://youtube.com/..."
              className="bg-dark text-white border-secondary"
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section mt-4">
        <div className="div-border-color my-3" />
        <div className="d-flex justify-content-end">
          <Button variant="warning" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                Creando...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle-fill me-2" /> CREAR INSTRUCTOR
              </>
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
}
