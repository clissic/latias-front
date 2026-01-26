import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function ActualizarInstructor({ instructor }) {
  const [instructorData, setInstructorData] = useState({
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
    contact: {
      email: "",
      phone: ""
    },
    socialMedia: {
      linkedin: "",
      twitter: "",
      instagram: "",
      youtube: ""
    }
  });

  // Estado para el archivo de imagen
  const [imageFile, setImageFile] = useState(null);

  // Estado para la preview de imagen
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (instructor) {
      setInstructorData({
        firstName: instructor.firstName || "",
        lastName: instructor.lastName || "",
        ci: instructor.ci?.toString() || "",
        profileImage: instructor.profileImage || "",
        profession: instructor.profession || "",
        experience: instructor.experience || "",
        bio: instructor.bio || "",
        certifications: instructor.certifications && instructor.certifications.length > 0 
          ? instructor.certifications 
          : [""],
        achievements: instructor.achievements && instructor.achievements.length > 0
          ? instructor.achievements
          : [""],
        courses: instructor.courses || [],
        contact: {
          email: instructor.contact?.email || "",
          phone: instructor.contact?.phone || ""
        },
        socialMedia: {
          linkedin: instructor.socialMedia?.linkedin || "",
          twitter: instructor.socialMedia?.twitter || "",
          instagram: instructor.socialMedia?.instagram || "",
          youtube: instructor.socialMedia?.youtube || ""
        }
      });

      // Cargar preview de imagen existente
      setImagePreview(instructor.profileImage || "");
    }
  }, [instructor]);

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setInstructorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setInstructorData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [name]: value
      }
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setInstructorData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };

  const handleCiChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    setInstructorData(prev => ({
      ...prev,
      ci: value
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

  // Eliminar imagen (al hacer click en la preview)
  const removeImage = () => {
    // Limpiar el archivo
    setImageFile(null);

    // Limpiar el preview
    setImagePreview("");

    // Limpiar el campo en instructorData
    setInstructorData(prev => ({
      ...prev,
      profileImage: ""
    }));

    // Limpiar el input file
    const fileInput = document.querySelector('input[type="file"][data-image-type="profileImage"]');
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const addCertification = () => {
    setInstructorData(prev => ({
      ...prev,
      certifications: [...prev.certifications, ""]
    }));
  };

  const removeCertification = (index) => {
    setInstructorData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationChange = (index, e) => {
    const { value } = e.target;
    setInstructorData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? value : cert
      )
    }));
  };

  const addAchievement = () => {
    setInstructorData(prev => ({
      ...prev,
      achievements: [...prev.achievements, ""]
    }));
  };

  const removeAchievement = (index) => {
    setInstructorData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleAchievementChange = (index, e) => {
    const { value } = e.target;
    setInstructorData(prev => ({
      ...prev,
      achievements: prev.achievements.map((ach, i) => 
        i === index ? value : ach
      )
    }));
  };

  const addCourse = () => {
    const courseId = prompt("Ingrese el ID del curso (número):");
    if (courseId && !isNaN(courseId)) {
      const courseIdNum = parseInt(courseId);
      if (!instructorData.courses.includes(courseIdNum)) {
        setInstructorData(prev => ({
          ...prev,
          courses: [...prev.courses, courseIdNum]
        }));
      } else {
        Swal.fire({
          icon: "warning",
          title: "Curso ya agregado",
          text: "Este curso ya está en la lista",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    }
  };

  const removeCourse = (courseId) => {
    setInstructorData(prev => ({
      ...prev,
      courses: prev.courses.filter(id => id !== courseId)
    }));
  };

  const validateForm = () => {
    if (!instructorData.firstName || !instructorData.lastName || !instructorData.ci || !instructorData.profession || !instructorData.contact.email) {
      return "Los campos firstName, lastName, ci, profession y contact.email son requeridos";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!instructor || !instructor._id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el instructor a actualizar",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      Swal.fire({
        icon: "error",
        title: "Error de validación",
        text: validationError,
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
      // Subir imagen si hay archivo nuevo
      let uploadedImagePath = instructorData.profileImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        const uploadResponse = await apiService.uploadInstructorImage(formData);
        
        if (uploadResponse.status === "success") {
          uploadedImagePath = uploadResponse.payload.profileImage;
        } else {
          throw new Error(uploadResponse.msg || "Error al subir la imagen");
        }
      }

      const processedData = {
        ...instructorData,
        ci: parseInt(instructorData.ci),
        profileImage: uploadedImagePath,
        certifications: instructorData.certifications.filter(cert => cert.trim() !== ""),
        achievements: instructorData.achievements.filter(ach => ach.trim() !== "")
      };

      const response = await apiService.updateInstructor(instructor._id, processedData);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Instructor actualizado",
          text: response.msg || "El instructor se ha actualizado exitosamente",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      } else {
        throw new Error(response.msg || "Error al actualizar el instructor");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al actualizar el instructor",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  if (!instructor) {
    return (
      <div className="text-white">
        <p>No se encontró el instructor para actualizar.</p>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="crear-curso-form">
      <div className="form-section">
        <h5 className="text-orange mb-3">Datos básicos del instructor:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={instructorData.firstName}
              onChange={handleBasicChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Apellido *</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={instructorData.lastName}
              onChange={handleBasicChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Documento Nacional de Identidad *</Form.Label>
            <Form.Control
              type="text"
              name="ci"
              value={instructorData.ci}
              onChange={handleCiChange}
              required
            />
            <Form.Text className="text-muted">
              Sin puntos ni guiones
            </Form.Text>
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Imagen de perfil</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              data-image-type="profileImage"
              onChange={handleImageChange}
            />
            <Form.Text className="text-muted d-block mb-2">
              Resolución óptima: 500x500px
            </Form.Text>
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview perfil" 
                  onClick={removeImage}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '150px', 
                    borderRadius: '5px',
                    cursor: 'pointer',
                    border: '2px solid rgba(255, 165, 0, 0.5)'
                  }}
                  title="Click para eliminar"
                />
              </div>
            )}
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label>Profesión *</Form.Label>
            <Form.Control
              type="text"
              name="profession"
              value={instructorData.profession}
              onChange={handleBasicChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label>Experiencia</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="experience"
              value={instructorData.experience}
              onChange={handleBasicChange}
            />
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label>Biografía</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="bio"
              value={instructorData.bio}
              onChange={handleBasicChange}
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mt-4 gap-2 gap-md-0">
          <h5 className="text-orange mb-0">Certificaciones:</h5>
          <Button variant="success" size="sm" onClick={addCertification}>
            <i className="bi bi-plus-circle-fill me-1"></i> Agregar Certificación
          </Button>
        </div>
        <div className="div-border-color my-3"></div>
        
        {instructorData.certifications.map((cert, index) => (
          <div key={index} className="mb-2">
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={cert}
                onChange={(e) => handleCertificationChange(index, e)}
                placeholder="Certificación"
                className="flex-grow-1"
              />
              {instructorData.certifications.length > 1 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeCertification(index)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mt-4 gap-2 gap-md-0">
          <h5 className="text-orange mb-0">Logros:</h5>
          <Button variant="success" size="sm" onClick={addAchievement}>
            <i className="bi bi-plus-circle-fill me-1"></i> Agregar Logro
          </Button>
        </div>
        <div className="div-border-color my-3"></div>
        
        {instructorData.achievements.map((ach, index) => (
          <div key={index} className="mb-2">
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={ach}
                onChange={(e) => handleAchievementChange(index, e)}
                placeholder="Logro"
                className="flex-grow-1"
              />
              {instructorData.achievements.length > 1 && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeAchievement(index)}
                >
                  <i className="bi bi-trash"></i>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="form-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mt-4 gap-2 gap-md-0">
          <h5 className="text-orange mb-0">Cursos asignados:</h5>
          <Button variant="success" size="sm" onClick={addCourse}>
            <i className="bi bi-plus-circle-fill me-1"></i> Agregar Curso
          </Button>
        </div>
        <div className="div-border-color my-3"></div>
        
        <div className="mb-3">
          {instructorData.courses.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {instructorData.courses.map((courseId) => (
                <span key={courseId} className="badge bg-primary d-flex align-items-center gap-2">
                  Curso ID: {courseId}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => removeCourse(courseId)}
                    style={{ fontSize: '0.7rem' }}
                  ></button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-white">No hay cursos asignados</p>
          )}
        </div>
      </div>

      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Contacto:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Email *</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={instructorData.contact.email}
              onChange={handleContactChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={instructorData.contact.phone}
              onChange={handleContactChange}
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Redes sociales:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>LinkedIn</Form.Label>
            <Form.Control
              type="url"
              name="linkedin"
              value={instructorData.socialMedia.linkedin}
              onChange={handleSocialMediaChange}
              placeholder="https://linkedin.com/in/usuario"
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Twitter</Form.Label>
            <Form.Control
              type="url"
              name="twitter"
              value={instructorData.socialMedia.twitter}
              onChange={handleSocialMediaChange}
              placeholder="https://twitter.com/usuario"
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Instagram</Form.Label>
            <Form.Control
              type="url"
              name="instagram"
              value={instructorData.socialMedia.instagram}
              onChange={handleSocialMediaChange}
              placeholder="https://instagram.com/usuario"
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>YouTube</Form.Label>
            <Form.Control
              type="url"
              name="youtube"
              value={instructorData.socialMedia.youtube}
              onChange={handleSocialMediaChange}
              placeholder="https://youtube.com/@usuario"
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section mt-4">
        <div className="div-border-color my-3"></div>
        <div className="d-flex justify-content-end">
          <Button variant="warning" type="submit" size="lg" className="px-5">
            <i className="bi bi-check-circle-fill me-2"></i> ACTUALIZAR INSTRUCTOR
          </Button>
        </div>
      </div>
    </Form>
  );
}
