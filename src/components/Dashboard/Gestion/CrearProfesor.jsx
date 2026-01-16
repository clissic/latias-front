import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function CrearProfesor() {
  const [professorData, setProfessorData] = useState({
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

  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setProfessorData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setProfessorData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [name]: value
      }
    }));
  };

  const handleSocialMediaChange = (e) => {
    const { name, value } = e.target;
    setProfessorData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [name]: value
      }
    }));
  };

  const handleCiChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    setProfessorData(prev => ({
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

    // Limpiar el campo en professorData
    setProfessorData(prev => ({
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
    setProfessorData(prev => ({
      ...prev,
      certifications: [...prev.certifications, ""]
    }));
  };

  const removeCertification = (index) => {
    setProfessorData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationChange = (index, e) => {
    const { value } = e.target;
    setProfessorData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? value : cert
      )
    }));
  };

  const addAchievement = () => {
    setProfessorData(prev => ({
      ...prev,
      achievements: [...prev.achievements, ""]
    }));
  };

  const removeAchievement = (index) => {
    setProfessorData(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleAchievementChange = (index, e) => {
    const { value } = e.target;
    setProfessorData(prev => ({
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
      if (!professorData.courses.includes(courseIdNum)) {
        setProfessorData(prev => ({
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
    setProfessorData(prev => ({
      ...prev,
      courses: prev.courses.filter(id => id !== courseId)
    }));
  };

  const validateForm = () => {
    if (!professorData.firstName || !professorData.lastName || !professorData.ci || !professorData.profession || !professorData.contact.email) {
      return "Los campos firstName, lastName, ci, profession y contact.email son requeridos";
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      // Subir imagen si hay archivo
      let uploadedImagePath = professorData.profileImage;

      if (imageFile) {
        const formData = new FormData();
        formData.append('profileImage', imageFile);

        const uploadResponse = await apiService.uploadProfessorImage(formData);
        
        if (uploadResponse.status === "success") {
          uploadedImagePath = uploadResponse.payload.profileImage;
        } else {
          throw new Error(uploadResponse.msg || "Error al subir la imagen");
        }
      }

      // Filtrar certificaciones y logros vacíos
      const processedData = {
        ...professorData,
        ci: parseInt(professorData.ci),
        profileImage: uploadedImagePath,
        certifications: professorData.certifications.filter(cert => cert.trim() !== ""),
        achievements: professorData.achievements.filter(ach => ach.trim() !== "")
      };

      const response = await apiService.createProfessor(processedData);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Profesor creado",
          text: response.msg || "El profesor se ha creado exitosamente",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });

        // Resetear formulario
        setProfessorData({
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

        // Resetear archivo e imagen
        setImageFile(null);
        setImagePreview("");
      } else {
        throw new Error(response.msg || "Error al crear el profesor");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al crear el profesor",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="crear-curso-form">
      <div className="form-section">
        <h5 className="text-orange mb-3">Datos básicos del profesor:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>Nombre *</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={professorData.firstName}
              onChange={handleBasicChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Apellido *</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={professorData.lastName}
              onChange={handleBasicChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Documento Nacional de Identidad *</Form.Label>
            <Form.Control
              type="text"
              name="ci"
              value={professorData.ci}
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
            {professorData.profileImage && !imageFile && (
              <div className="mt-2">
                <img 
                  src={professorData.profileImage} 
                  alt="Imagen actual" 
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
              value={professorData.profession}
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
              value={professorData.experience}
              onChange={handleBasicChange}
            />
          </Form.Group>

          <Form.Group className="col-12">
            <Form.Label>Biografía</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              name="bio"
              value={professorData.bio}
              onChange={handleBasicChange}
            />
          </Form.Group>
        </div>
      </div>

      <div className="form-section">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mt-4 gap-2 gap-md-0">
          <h5 className="text-orange mb-0">Certificaciones:</h5>
          <Button variant="success" size="sm" onClick={addCertification}>
            <i className="bi bi-plus-circle me-1"></i> Agregar Certificación
          </Button>
        </div>
        <div className="div-border-color my-3"></div>
        
        {professorData.certifications.map((cert, index) => (
          <div key={index} className="mb-2">
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={cert}
                onChange={(e) => handleCertificationChange(index, e)}
                placeholder="Certificación"
                className="flex-grow-1"
              />
              {professorData.certifications.length > 1 && (
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
            <i className="bi bi-plus-circle me-1"></i> Agregar Logro
          </Button>
        </div>
        <div className="div-border-color my-3"></div>
        
        {professorData.achievements.map((ach, index) => (
          <div key={index} className="mb-2">
            <div className="d-flex gap-2">
              <Form.Control
                type="text"
                value={ach}
                onChange={(e) => handleAchievementChange(index, e)}
                placeholder="Logro"
                className="flex-grow-1"
              />
              {professorData.achievements.length > 1 && (
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
            <i className="bi bi-plus-circle me-1"></i> Agregar Curso
          </Button>
        </div>
        <div className="div-border-color my-3"></div>
        
        <div className="mb-3">
          {professorData.courses.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {professorData.courses.map((courseId) => (
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
              value={professorData.contact.email}
              onChange={handleContactChange}
              required
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Teléfono</Form.Label>
            <Form.Control
              type="text"
              name="phone"
              value={professorData.contact.phone}
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
              value={professorData.socialMedia.linkedin}
              onChange={handleSocialMediaChange}
              placeholder="https://linkedin.com/in/usuario"
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Twitter</Form.Label>
            <Form.Control
              type="url"
              name="twitter"
              value={professorData.socialMedia.twitter}
              onChange={handleSocialMediaChange}
              placeholder="https://twitter.com/usuario"
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>Instagram</Form.Label>
            <Form.Control
              type="url"
              name="instagram"
              value={professorData.socialMedia.instagram}
              onChange={handleSocialMediaChange}
              placeholder="https://instagram.com/usuario"
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-6">
            <Form.Label>YouTube</Form.Label>
            <Form.Control
              type="url"
              name="youtube"
              value={professorData.socialMedia.youtube}
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
            <i className="bi bi-check-circle me-2"></i> CREAR PROFESOR
          </Button>
        </div>
      </div>
    </Form>
  );
}
