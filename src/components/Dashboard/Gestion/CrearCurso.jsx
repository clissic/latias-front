import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import Swal from "sweetalert2";
import { apiService } from "../../../services/apiService";
import "./CrearCurso.css";

export function CrearCurso() {
  // Estado inicial del curso
  const [courseData, setCourseData] = useState({
    sku: "",
    courseName: "",
    bannerUrl: "",
    image: "",
    shortImage: "",
    currency: "UYU",
    shortDescription: "",
    longDescription: "",
    duration: "",
    price: 0,
    difficulty: "",
    category: "",
    professor: {
      firstName: "",
      lastName: "",
      profession: ""
    },
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

  // Manejar cambios en datos básicos del curso
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Manejar cambios en datos del profesor
  const handleProfessorChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      professor: {
        ...prev.professor,
        [name]: value
      }
    }));
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
                      options: question.options.map((option, optIdx) =>
                        optIdx === optionIndex
                          ? {
                              ...option,
                              [name]: type === "checkbox" ? checked : value
                            }
                          : option
                      )
                    }
                  : question
              )
            }
          : module
      )
    }));
  };

  // Generar IDs automáticos basados en índices (empezando desde 0)
  const generateAutoIds = (data) => {
    // Generar courseId único
    const courseId = `course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const processedData = {
      ...data,
      courseId: courseId,
      modules: data.modules.map((module, moduleIndex) => ({
        ...module,
        moduleId: `module_${moduleIndex}`,
        lessons: module.lessons.map((lesson, lessonIndex) => ({
          ...lesson,
          lessonId: `lesson_${moduleIndex}_${lessonIndex}`
        })),
        questionBank: module.questionBank.map((question, questionIndex) => ({
          ...question,
          questionId: `question_${moduleIndex}_${questionIndex}`,
          options: question.options.map((option, optionIndex) => ({
            ...option,
            optionId: `option_${moduleIndex}_${questionIndex}_${optionIndex}`
          }))
        }))
      }))
    };
    
    return processedData;
  };

  // Validar formulario
  const validateForm = () => {
    if (!courseData.sku || !courseData.courseName || !courseData.price || !courseData.category) {
      return "Los campos sku, courseName, price y category son requeridos";
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
        const hasCorrectAnswer = question.options.some(opt => opt.isCorrect);
        if (!hasCorrectAnswer) {
          return `La pregunta ${j + 1} del módulo ${i + 1} debe tener al menos una opción correcta`;
        }
      }
    }

    return null;
  };

  // Manejar envío del formulario
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

    // Generar IDs automáticos basados en índices
    const processedData = generateAutoIds(courseData);

    try {
      const response = await apiService.createCourse(processedData);
      
      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Curso creado",
          text: response.msg || "El curso se ha creado exitosamente",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      } else {
        throw new Error(response.msg || "Error al crear el curso");
      }

      // Resetear formulario
      setCourseData({
        sku: "",
        courseName: "",
        bannerUrl: "",
        image: "",
        shortImage: "",
        currency: "UYU",
        shortDescription: "",
        longDescription: "",
        duration: "",
        price: 0,
        difficulty: "",
        category: "",
        professor: {
          firstName: "",
          lastName: "",
          profession: ""
        },
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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Hubo un error al crear el curso",
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
      {/* Datos básicos del curso */}
      <div className="form-section">
        <h5 className="text-orange mb-3">Datos básicos del curso:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-6">
            <Form.Label>SKU *</Form.Label>
            <Form.Control
              type="text"
              name="sku"
              value={courseData.sku}
              onChange={handleBasicChange}
              required
            />
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
              <option value="UYU">UYU</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
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
              <option value="Astronómica">Astronómica</option>
              <option value="Costera">Costera</option>
              <option value="Marinería">Marinería</option>
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
            <Form.Control
              type="text"
              name="duration"
              value={courseData.duration}
              onChange={handleBasicChange}
              placeholder="Ej: 40 horas"
            />
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
            <Form.Label>URL Banner</Form.Label>
            <Form.Control
              type="url"
              name="bannerUrl"
              value={courseData.bannerUrl}
              onChange={handleBasicChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>URL Imagen</Form.Label>
            <Form.Control
              type="url"
              name="image"
              value={courseData.image}
              onChange={handleBasicChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>URL Imagen Corta</Form.Label>
            <Form.Control
              type="url"
              name="shortImage"
              value={courseData.shortImage}
              onChange={handleBasicChange}
            />
          </Form.Group>
        </div>
      </div>

      {/* Datos del profesor */}
      <div className="form-section">
        <h5 className="text-orange mb-3 mt-4">Datos del profesor:</h5>
        <div className="div-border-color my-3"></div>
        
        <div className="row g-3">
          <Form.Group className="col-12 col-md-4">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={courseData.professor.firstName}
              onChange={handleProfessorChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={courseData.professor.lastName}
              onChange={handleProfessorChange}
            />
          </Form.Group>

          <Form.Group className="col-12 col-md-4">
            <Form.Label>Profesión</Form.Label>
            <Form.Control
              type="text"
              name="profession"
              value={courseData.professor.profession}
              onChange={handleProfessorChange}
            />
          </Form.Group>
        </div>
      </div>

      {/* Módulos */}
      <div className="form-section">
        <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
          <h5 className="text-orange mb-0">Módulos:</h5>
          <Button variant="success" size="sm" onClick={addModule}>
            <i className="bi bi-plus-circle me-1"></i> Agregar Módulo
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-white">Lecciones:</h6>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => addLesson(moduleIndex)}
                >
                  <i className="bi bi-plus-circle me-1"></i> Agregar Lección
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
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-white">Banco de Preguntas:</h6>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => addQuestion(moduleIndex)}
                >
                  <i className="bi bi-plus-circle me-1"></i> Agregar Pregunta
                </Button>
              </div>

              {module.questionBank.map((question, questionIndex) => (
                <div key={questionIndex} className="question-card mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-white">Pregunta {questionIndex + 1}</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeQuestion(moduleIndex, questionIndex)}
                    >
                      <i className="bi bi-trash"></i> Eliminar
                    </Button>
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
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="text-white">Opciones:</Form.Label>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => addOption(moduleIndex, questionIndex)}
                      >
                        <i className="bi bi-plus-circle me-1"></i> Agregar Opción
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
                          <Form.Group className="col-12 col-md-1">
                            <Form.Label>Correcta</Form.Label>
                            <Form.Check
                              type="checkbox"
                              name="isCorrect"
                              checked={option.isCorrect}
                              onChange={(e) => handleOptionChange(moduleIndex, questionIndex, optionIndex, e)}
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
          <Button variant="warning" type="submit" size="lg" className="px-5">
            <i className="bi bi-check-circle me-2"></i> CREAR CURSO
          </Button>
        </div>
      </div>
    </Form>
  );
}
