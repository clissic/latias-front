import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "../Gestion/CrearCurso.css";

export function SolicitarModificacionCurso({ course, instructor, onBack }) {
  // Estado inicial del curso
  const [courseData, setCourseData] = useState({
    skuPart1: "",
    skuPart2: "",
    skuPart3: "",
    courseName: "",
    bannerUrl: "",
    image: "",
    shortImage: "",
    currency: "USD",
    shortDescription: "",
    longDescription: "",
    duration: 0,
    price: 0,
    difficulty: "",
    category: "",
    instructor: {
      firstName: "",
      lastName: "",
      profession: ""
    },
    selectedInstructorId: "",
    modules: [
      {
        moduleName: "",
        moduleDescription: "",
        lessons: [
          {
            lessonName: "",
            lessonDescription: "",
            videoUrl: "",
            completed: false
          }
        ],
        questionBank: [
          {
            questionText: "",
            options: [
              { optionText: "", isCorrect: false },
              { optionText: "", isCorrect: false }
            ]
          }
        ]
      }
    ]
  });

  // Estado para los archivos de imagen
  const [imageFiles, setImageFiles] = useState({
    bannerUrl: null,
    image: null,
    shortImage: null
  });

  // Estado para las previews de imágenes
  const [imagePreviews, setImagePreviews] = useState({
    bannerUrl: "",
    image: "",
    shortImage: ""
  });

  // Estado para el loading del formulario
  const [isLoading, setIsLoading] = useState(false);

  // Función para dividir SKU en partes
  const splitSku = (sku) => {
    if (!sku) return { part1: "", part2: "", part3: "" };
    const parts = sku.split("-");
    return {
      part1: parts[0] || "",
      part2: parts[1] || "",
      part3: parts[2] || ""
    };
  };

  // Precargar datos cuando course cambie
  useEffect(() => {
    if (course) {
      const skuParts = splitSku(course.sku);
      
      // Manejar instructor: puede ser un array o un objeto
      // También verificar si viene como 'professor' (legacy) o 'instructor' (nuevo)
      let instructorData = {
        firstName: "",
        lastName: "",
        profession: ""
      };
      
      const instructorSource = course.instructor || course.professor;
      
      if (instructorSource) {
        if (Array.isArray(instructorSource) && instructorSource.length > 0) {
          // Si es un array, tomar el primer elemento
          instructorData = {
            firstName: instructorSource[0].firstName || "",
            lastName: instructorSource[0].lastName || "",
            profession: instructorSource[0].profession || ""
          };
        } else if (typeof instructorSource === 'object') {
          // Si es un objeto, usarlo directamente
          instructorData = {
            firstName: instructorSource.firstName || "",
            lastName: instructorSource.lastName || "",
            profession: instructorSource.profession || ""
          };
        }
      }
      
      setCourseData({
        courseId: course.courseId || course._id,
        skuPart1: skuParts.part1,
        skuPart2: skuParts.part2,
        skuPart3: skuParts.part3,
        courseName: course.courseName || "",
        bannerUrl: course.bannerUrl || "",
        image: course.image || "",
        shortImage: course.shortImage || "",
        currency: course.currency || "USD",
        shortDescription: course.shortDescription || "",
        longDescription: course.longDescription || "",
        duration: course.duration || 0,
        price: course.price || 0,
        difficulty: course.difficulty || "",
        category: course.category || "",
        instructor: instructorData,
        selectedInstructorId: "",
        modules: course.modules && course.modules.length > 0 ? course.modules : [
          {
            moduleName: "",
            moduleDescription: "",
            lessons: [
              {
                lessonName: "",
                lessonDescription: "",
                videoUrl: "",
                completed: false
              }
            ],
            questionBank: [
              {
                questionText: "",
                options: [
                  { optionText: "", isCorrect: false },
                  { optionText: "", isCorrect: false }
                ]
              }
            ]
          }
        ]
      });

      // Establecer previews de imágenes
      setImagePreviews({
        bannerUrl: course.bannerUrl || "",
        image: course.image || "",
        shortImage: course.shortImage || ""
      });
    }
  }, [course]);

  // Manejar cambios en datos básicos del curso
  const handleBasicChange = (e) => {
    const { name, value, type } = e.target;
    // Convertir a número si es un campo numérico
    const processedValue = type === "number" ? (value === "" ? 0 : parseFloat(value) || 0) : value;
    setCourseData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // Manejar cambios en las partes del SKU
  const handleSkuChange = (part, e) => {
    let value = e.target.value.toUpperCase(); // Convertir a mayúsculas
    
    if (part === 3) {
      // Solo números para la tercera parte
      value = value.replace(/[^0-9]/g, '');
      if (value.length > 3) value = value.slice(0, 3);
    } else {
      // Solo letras para las primeras dos partes
      value = value.replace(/[^A-Z]/g, '');
      if (value.length > 3) value = value.slice(0, 3);
    }
    
    setCourseData(prev => ({
      ...prev,
      [`skuPart${part}`]: value
    }));
  };

  // Manejar cambios en archivos de imagen
  const handleImageChange = (imageType, e) => {
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
      setImageFiles(prev => ({
        ...prev,
        [imageType]: file
      }));

      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => ({
          ...prev,
          [imageType]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Eliminar imagen (al hacer click en la preview)
  const removeImage = (imageType) => {
    // Limpiar el archivo
    setImageFiles(prev => ({
      ...prev,
      [imageType]: null
    }));

    // Limpiar el preview
    setImagePreviews(prev => ({
      ...prev,
      [imageType]: ""
    }));

    // Limpiar el campo en courseData
    setCourseData(prev => ({
      ...prev,
      [imageType]: ""
    }));

    // Limpiar el input file
    const fileInput = document.querySelector(`input[type="file"][data-image-type="${imageType}"]`);
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // Agregar nuevo módulo
  const addModule = () => {
    setCourseData(prev => ({
      ...prev,
      modules: [
        ...prev.modules,
        {
          moduleName: "",
          moduleDescription: "",
          lessons: [
            {
              lessonName: "",
              lessonDescription: "",
              videoUrl: "",
              completed: false
            }
          ],
          questionBank: [
            {
              questionText: "",
              options: [
                { optionText: "", isCorrect: false },
                { optionText: "", isCorrect: false }
              ]
            }
          ]
        }
      ]
    }));
  };

  // Eliminar módulo
  const removeModule = (moduleIndex) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter((_, index) => index !== moduleIndex)
    }));
  };

  // Manejar cambios en módulo
  const handleModuleChange = (moduleIndex, e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex
          ? { ...module, [name]: value }
          : module
      )
    }));
  };

  // Agregar lección a un módulo
  const addLesson = (moduleIndex) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: [
                ...module.lessons,
                {
                  lessonName: "",
                  lessonDescription: "",
                  videoUrl: "",
                  completed: false
                }
              ]
            }
          : module
      )
    }));
  };

  // Eliminar lección de un módulo
  const removeLesson = (moduleIndex, lessonIndex) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.filter((_, idx) => idx !== lessonIndex)
            }
          : module
      )
    }));
  };

  // Manejar cambios en lección
  const handleLessonChange = (moduleIndex, lessonIndex, e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, modIdx) =>
        modIdx === moduleIndex
          ? {
              ...module,
              lessons: module.lessons.map((lesson, lesIdx) =>
                lesIdx === lessonIndex
                  ? { ...lesson, [name]: value }
                  : lesson
              )
            }
          : module
      )
    }));
  };

  // Agregar pregunta al banco de preguntas de un módulo
  const addQuestion = (moduleIndex) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              questionBank: [
                ...module.questionBank,
                {
                  questionText: "",
                  options: [
                    { optionText: "", isCorrect: false },
                    { optionText: "", isCorrect: false }
                  ]
                }
              ]
            }
          : module
      )
    }));
  };

  // Eliminar pregunta del banco de preguntas
  const removeQuestion = (moduleIndex, questionIndex) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, index) =>
        index === moduleIndex
          ? {
              ...module,
              questionBank: module.questionBank.filter((_, idx) => idx !== questionIndex)
            }
          : module
      )
    }));
  };

  // Manejar cambios en pregunta
  const handleQuestionChange = (moduleIndex, questionIndex, e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, modIdx) =>
        modIdx === moduleIndex
          ? {
              ...module,
              questionBank: module.questionBank.map((question, qIdx) =>
                qIdx === questionIndex
                  ? { ...question, [name]: value }
                  : question
              )
            }
          : module
      )
    }));
  };

  // Agregar opción a una pregunta
  const addOption = (moduleIndex, questionIndex) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, modIdx) =>
        modIdx === moduleIndex
          ? {
              ...module,
              questionBank: module.questionBank.map((question, qIdx) =>
                qIdx === questionIndex
                  ? {
                      ...question,
                      options: [
                        ...question.options,
                        { optionText: "", isCorrect: false }
                      ]
                    }
                  : question
              )
            }
          : module
      )
    }));
  };

  // Eliminar opción de una pregunta
  const removeOption = (moduleIndex, questionIndex, optionIndex) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, modIdx) =>
        modIdx === moduleIndex
          ? {
              ...module,
              questionBank: module.questionBank.map((question, qIdx) =>
                qIdx === questionIndex
                  ? {
                      ...question,
                      options: question.options.filter((_, optIdx) => optIdx !== optionIndex)
                    }
                  : question
              )
            }
          : module
      )
    }));
  };

  // Manejar cambios en opción
  const handleOptionChange = (moduleIndex, questionIndex, optionIndex, e) => {
    const { name, value, type, checked } = e.target;
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.map((module, modIdx) =>
        modIdx === moduleIndex
          ? {
              ...module,
              questionBank: module.questionBank.map((question, qIdx) =>
                qIdx === questionIndex
                  ? {
                      ...question,
                      options: question.options.map((option, optIdx) => {
                        // Si es el checkbox de "isCorrect" y se está marcando como correcto
                        if (name === "isCorrect" && type === "checkbox" && checked) {
                          // Solo la opción seleccionada será true, las demás false
                          return {
                            ...option,
                            isCorrect: optIdx === optionIndex
                          };
                        }
                        // Para otros campos o cuando se desmarca
                        return optIdx === optionIndex
                          ? {
                              ...option,
                              [name]: type === "checkbox" ? checked : value
                            }
                          : option;
                      })
                    }
                  : question
              )
            }
          : module
      )
    }));
  };

  // Validar formulario
  const validateForm = () => {
    if (!courseData.skuPart1 || !courseData.skuPart2 || !courseData.skuPart3 || !courseData.courseName || !courseData.price || !courseData.category) {
      return "Los campos SKU (todas las partes), courseName, price y category son requeridos";
    }

    if (courseData.modules.length === 0) {
      return "Debe agregar al menos un módulo";
    }

    for (let i = 0; i < courseData.modules.length; i++) {
      const module = courseData.modules[i];
      if (!module.moduleName) {
        return `El módulo ${i + 1} debe tener un nombre`;
      }
      if (module.lessons.length === 0) {
        return `El módulo ${i + 1} debe tener al menos una lección`;
      }
      for (let j = 0; j < module.lessons.length; j++) {
        const lesson = module.lessons[j];
        if (!lesson.lessonName) {
          return `La lección ${j + 1} del módulo ${i + 1} debe tener un nombre`;
        }
      }
      for (let j = 0; j < module.questionBank.length; j++) {
        const question = module.questionBank[j];
        if (!question.questionText) {
          return `La pregunta ${j + 1} del módulo ${i + 1} debe tener un texto`;
        }
        if (question.options.length < 2) {
          return `La pregunta ${j + 1} del módulo ${i + 1} debe tener al menos 2 opciones`;
        }
        for (let k = 0; k < question.options.length; k++) {
          const option = question.options[k];
          if (!option.optionText) {
            return `La opción ${k + 1} de la pregunta ${j + 1} del módulo ${i + 1} debe tener un texto`;
          }
        }
        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          return `La pregunta ${j + 1} del módulo ${i + 1} debe tener al menos una opción correcta`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!course || !course.courseId) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se encontró el curso a modificar",
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

    setIsLoading(true);

    try {
      // Preparar datos del instructor
      const instructorData = {
        firstName: instructor?.firstName || "",
        lastName: instructor?.lastName || "",
        ci: instructor?.ci || "",
        email: instructor?.contact?.email || "",
        profession: instructor?.profession || ""
      };

      // Preparar datos del curso (incluyendo módulos, lecciones, preguntas)
      const sku = `${courseData.skuPart1}-${courseData.skuPart2}-${courseData.skuPart3}`;
      
      // Preparar datos de imágenes (si hay archivos nuevos, usar las previews, si no, usar las URLs existentes)
      const imageData = {
        bannerUrl: imageFiles.bannerUrl ? imagePreviews.bannerUrl : courseData.bannerUrl,
        image: imageFiles.image ? imagePreviews.image : courseData.image,
        shortImage: imageFiles.shortImage ? imagePreviews.shortImage : courseData.shortImage
      };

      const courseDataToSend = {
        sku: sku,
        courseName: courseData.courseName,
        category: courseData.category,
        difficulty: courseData.difficulty,
        duration: courseData.duration,
        price: courseData.price,
        currency: courseData.currency,
        shortDescription: courseData.shortDescription,
        longDescription: courseData.longDescription,
        bannerUrl: imageData.bannerUrl,
        image: imageData.image,
        shortImage: imageData.shortImage,
        modules: courseData.modules
      };

      const response = await apiService.requestCourseModification(
        course.courseId,
        instructorData,
        courseDataToSend
      );
      
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Solicitud enviada",
          text: response.msg || "Tu solicitud de modificación ha sido enviada exitosamente. Te notificaremos cuando sea revisada.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        }).then(() => {
          if (onBack) {
            onBack();
          }
        });
      } else {
        throw new Error(response.msg || "Error al enviar la solicitud");
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al enviar la solicitud de modificación",
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

  if (!course) {
    return (
      <div className="text-white">
        <p>No se encontró el curso para modificar.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="text-orange mb-0">Solicitar Modificación de Curso</h4>
        {onBack && (
          <Button 
            variant="outline-secondary"
            onClick={onBack}
            className="btn-orange-custom"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Volver
          </Button>
        )}
      </div>

      <Form onSubmit={handleSubmit} className="crear-curso-form">
        {/* Datos básicos del curso */}
        <div className="form-section">
          <h5 className="text-orange mb-3">Datos básicos del curso:</h5>
          <div className="div-border-color my-3"></div>
          
          <div className="row g-3">
            <Form.Group className="col-12">
              <Form.Label>SKU *</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="text"
                  name="skuPart1"
                  value={courseData.skuPart1}
                  onChange={(e) => handleSkuChange(1, e)}
                  placeholder="NAV"
                  maxLength={3}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
                <span className="text-white">-</span>
                <Form.Control
                  type="text"
                  name="skuPart2"
                  value={courseData.skuPart2}
                  onChange={(e) => handleSkuChange(2, e)}
                  placeholder="COS"
                  maxLength={3}
                  style={{ textTransform: 'uppercase' }}
                  required
                />
                <span className="text-white">-</span>
                <Form.Control
                  type="text"
                  name="skuPart3"
                  value={courseData.skuPart3}
                  onChange={(e) => handleSkuChange(3, e)}
                  placeholder="001"
                  maxLength={3}
                  pattern="[0-9]*"
                  required
                />
              </div>
              <Form.Text className="text-muted">
                Formato: XXX-XXX-XXX (primeras dos partes: letras, tercera: números)
              </Form.Text>
            </Form.Group>

            <Form.Group className="col-12">
              <Form.Label>Nombre del Curso *</Form.Label>
              <Form.Control
                type="text"
                name="courseName"
                value={courseData.courseName}
                onChange={handleBasicChange}
                required
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-4">
              <Form.Label>Precio *</Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={courseData.price}
                onChange={handleBasicChange}
                min="0"
                step="0.01"
                required
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-4">
              <Form.Label>Moneda</Form.Label>
              <Form.Select
                name="currency"
                value={courseData.currency}
                onChange={handleBasicChange}
              >
                <option value="USD">USD</option>
                <option value="UYU">UYU</option>
                <option value="EUR">EUR</option>
                <option value="ARS">ARS</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-12 col-md-4">
              <Form.Label>Categoría *</Form.Label>
              <Form.Select
                name="category"
                value={courseData.category}
                onChange={handleBasicChange}
                required
              >
                <option value="">Seleccione una categoría</option>
                <option value="Costera">Costera</option>
                <option value="Astronómica">Astronómica</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Otros">Otros</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label>Dificultad</Form.Label>
              <Form.Select
                name="difficulty"
                value={courseData.difficulty}
                onChange={handleBasicChange}
              >
                <option value="">Seleccione dificultad</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="col-12 col-md-6">
              <Form.Label>Duración</Form.Label>
              <div className="d-flex align-items-center gap-2">
                <Form.Control
                  type="number"
                  name="duration"
                  value={courseData.duration}
                  onChange={handleBasicChange}
                  min="0"
                  step="0.5"
                  placeholder="0"
                />
                <span className="text-white">horas</span>
              </div>
            </Form.Group>

            <Form.Group className="col-12">
              <Form.Label>Descripción Corta</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="shortDescription"
                value={courseData.shortDescription}
                onChange={handleBasicChange}
              />
            </Form.Group>

            <Form.Group className="col-12">
              <Form.Label>Descripción Larga</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="longDescription"
                value={courseData.longDescription}
                onChange={handleBasicChange}
              />
            </Form.Group>

            <Form.Group className="col-12 col-md-4">
              <Form.Label>Banner del Curso</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                data-image-type="bannerUrl"
                onChange={(e) => handleImageChange('bannerUrl', e)}
              />
              <Form.Text className="text-muted d-block mb-2">
                Resolución óptima: 1920x1080px
              </Form.Text>
              {imagePreviews.bannerUrl && (
                <div className="mt-2">
                  <img 
                    src={imagePreviews.bannerUrl} 
                    alt="Preview banner" 
                    onClick={() => removeImage('bannerUrl')}
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

            <Form.Group className="col-12 col-md-4">
              <Form.Label>Imagen del Curso</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                data-image-type="image"
                onChange={(e) => handleImageChange('image', e)}
              />
              <Form.Text className="text-muted d-block mb-2">
                Resolución óptima: 800x600px
              </Form.Text>
              {imagePreviews.image && (
                <div className="mt-2">
                  <img 
                    src={imagePreviews.image} 
                    alt="Preview imagen" 
                    onClick={() => removeImage('image')}
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

            <Form.Group className="col-12 col-md-4">
              <Form.Label>Imagen Corta del Curso</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                data-image-type="shortImage"
                onChange={(e) => handleImageChange('shortImage', e)}
              />
              <Form.Text className="text-muted d-block mb-2">
                Resolución óptima: 400x300px
              </Form.Text>
              {imagePreviews.shortImage && (
                <div className="mt-2">
                  <img 
                    src={imagePreviews.shortImage} 
                    alt="Preview imagen corta" 
                    onClick={() => removeImage('shortImage')}
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

            <div className="col-12 mt-2 mb-3">
              <Form.Text className="text-muted">
                <strong>Formatos aceptados:</strong> JPEG, JPG, PNG, GIF, WEBP (máximo 5MB por imagen)
              </Form.Text>
            </div>
          </div>
        </div>

        {/* Módulos */}
        <div className="form-section">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3 mt-4 gap-2 gap-md-0">
            <h5 className="text-orange mb-0">Módulos:</h5>
            <Button variant="success" size="sm" onClick={addModule}>
              <i className="bi bi-plus-circle-fill me-1"></i> Agregar Módulo
            </Button>
          </div>
          <div className="div-border-color my-3"></div>

          {courseData.modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="module-card mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-orange">Módulo {moduleIndex + 1}</h6>
                {courseData.modules.length > 1 && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeModule(moduleIndex)}
                  >
                    <i className="bi bi-trash me-1"></i> Eliminar Módulo
                  </Button>
                )}
              </div>

              <div className="row g-3 mb-3">
                <Form.Group className="col-12">
                  <Form.Label>Nombre del Módulo *</Form.Label>
                  <Form.Control
                    type="text"
                    name="moduleName"
                    value={module.moduleName}
                    onChange={(e) => handleModuleChange(moduleIndex, e)}
                    required
                  />
                </Form.Group>

                <Form.Group className="col-12">
                  <Form.Label>Descripción del Módulo</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    name="moduleDescription"
                    value={module.moduleDescription}
                    onChange={(e) => handleModuleChange(moduleIndex, e)}
                  />
                </Form.Group>
              </div>

              {/* Lecciones del módulo */}
              <div className="lessons-section mb-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-2 gap-md-0">
                  <h6 className="text-white mb-0">Lecciones:</h6>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => addLesson(moduleIndex)}
                  >
                    <i className="bi bi-plus-circle-fill me-1"></i> Agregar Lección
                  </Button>
                </div>

                {module.lessons.map((lesson, lessonIndex) => (
                  <div key={lessonIndex} className="lesson-card mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-white">Lección {lessonIndex + 1}</span>
                      {module.lessons.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeLesson(moduleIndex, lessonIndex)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      )}
                    </div>
                    <div className="row g-2">
                      <Form.Group className="col-12 col-md-6">
                        <Form.Label>Nombre de la Lección *</Form.Label>
                        <Form.Control
                          type="text"
                          name="lessonName"
                          value={lesson.lessonName}
                          onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, e)}
                          required
                        />
                      </Form.Group>
                      <Form.Group className="col-12 col-md-6">
                        <Form.Label>Descripción</Form.Label>
                        <Form.Control
                          type="text"
                          name="lessonDescription"
                          value={lesson.lessonDescription}
                          onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, e)}
                        />
                      </Form.Group>
                      <Form.Group className="col-12 col-md-6">
                        <Form.Label>URL del Video</Form.Label>
                        <Form.Control
                          type="url"
                          name="videoUrl"
                          value={lesson.videoUrl}
                          onChange={(e) => handleLessonChange(moduleIndex, lessonIndex, e)}
                        />
                      </Form.Group>
                    </div>
                  </div>
                ))}
              </div>

              {/* Banco de preguntas del módulo */}
              <div className="questions-section">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-2 gap-md-0">
                  <h6 className="text-white mb-0">Banco de Preguntas:</h6>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => addQuestion(moduleIndex)}
                  >
                    <i className="bi bi-plus-circle-fill me-1"></i> Agregar Pregunta
                  </Button>
                </div>

                {module.questionBank.map((question, questionIndex) => (
                  <div key={questionIndex} className="question-card mb-3">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-2 gap-md-0">
                      <span className="text-white mb-0">Pregunta {questionIndex + 1}</span>
                      {module.questionBank.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeQuestion(moduleIndex, questionIndex)}
                        >
                          <i className="bi bi-trash"></i> Eliminar
                        </Button>
                      )}
                    </div>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Texto de la Pregunta *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="questionText"
                        value={question.questionText}
                        onChange={(e) => handleQuestionChange(moduleIndex, questionIndex, e)}
                        required
                      />
                    </Form.Group>

                    <div className="options-section">
                      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-2 gap-2 gap-md-0">
                        <Form.Label className="text-white mb-0">Opciones:</Form.Label>
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => addOption(moduleIndex, questionIndex)}
                        >
                          <i className="bi bi-plus-circle-fill me-1"></i> Agregar Opción
                        </Button>
                      </div>

                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="option-card mb-2">
                          <div className="row g-2 align-items-end">
                            <Form.Group className="col-12 col-md-6">
                              <Form.Label>Texto de la Opción *</Form.Label>
                              <Form.Control
                                type="text"
                                name="optionText"
                                value={option.optionText}
                                onChange={(e) => handleOptionChange(moduleIndex, questionIndex, optionIndex, e)}
                                required
                              />
                            </Form.Group>
                            <Form.Group className="col-12 col-md-auto d-flex align-items-end">
                              <Form.Check
                                type="checkbox"
                                name="isCorrect"
                                label="Correcta"
                                checked={option.isCorrect}
                                onChange={(e) => handleOptionChange(moduleIndex, questionIndex, optionIndex, e)}
                                className="mb-0"
                              />
                            </Form.Group>
                            {question.options.length > 2 && (
                              <div className="col-12 col-md-auto">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => removeOption(moduleIndex, questionIndex, optionIndex)}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Botón de envío */}
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
                  <i className="bi bi-send me-2"></i> SOLICITAR MODIFICACIÓN
                </>
              )}
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
