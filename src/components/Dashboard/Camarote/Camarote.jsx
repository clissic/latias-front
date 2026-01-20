import React, { useState, useEffect } from "react";
import { GestionarMisCursos } from "./GestionarMisCursos";
import { apiService } from "../../../services/apiService";
import "./Camarote.css";

export function Camarote({ user }) {
  const [activeSection, setActiveSection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [coursesCount, setCoursesCount] = useState(0);

  // Cargar contador de cursos asignados
  useEffect(() => {
    const loadCoursesCount = async () => {
      try {
        // Obtener el instructor por CI
        const instructorResponse = await apiService.getInstructorByCi(user?.ci);
        
        if (instructorResponse.status === "success" && instructorResponse.payload) {
          const instructorData = instructorResponse.payload;
          const courseIds = instructorData.courses || [];
          
          if (courseIds.length > 0) {
            // Obtener todos los cursos y filtrar por los IDs asignados
            const allCoursesResponse = await apiService.getCourses();
            
            if (allCoursesResponse.status === "success" && allCoursesResponse.payload) {
              const allCourses = allCoursesResponse.payload;
              // Los courseIds del instructor son strings (courseId del curso), buscar por courseId
              const myCourses = allCourses.filter(course => {
                const courseIdToCompare = course.courseId ? String(course.courseId) : null;
                return courseIdToCompare && courseIds.some(id => String(id) === courseIdToCompare);
              });
              setCoursesCount(myCourses.length);
            }
          } else {
            setCoursesCount(0);
          }
        }
      } catch (error) {
        console.error("Error al cargar contador de cursos:", error);
        setCoursesCount(0);
      }
    };

    if (user?.ci) {
      loadCoursesCount();
    }
  }, [user?.ci]);

  if (!user) return null;

  const handleCardClick = (section) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSection(section);
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackClick = () => {
    setActiveSection(null);
  };

  // Renderizar tarjetas
  const renderCards = () => (
    <div className={`row g-4 mb-4 camarote-cards-container ${isTransitioning ? 'camarote-cards-fade-out' : ''}`}>
      <div className="col-12 col-md-6 col-lg-4">
        <div 
          className={`camarote-card h-100 ${isTransitioning ? 'camarote-card-fade-out' : ''}`}
          onClick={() => handleCardClick('myCourses')}
        >
          <div className="camarote-card-content">
            <i className="bi bi-book-half text-orange mb-3" style={{ fontSize: "4rem" }}></i>
            <h4 className="text-white mb-3">Gestión de cursos impartidos</h4>
            <div className="d-flex align-items-center justify-content-center gap-2">
              <span className="text-orange" style={{ fontSize: "1rem" }}>Total:</span>
              <span className="text-orange" style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{coursesCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container d-flex flex-column align-items-center text-white col-12 col-lg-11">
      <div className="col-12">
        <h2 className="mb-3 text-orange">Camarote:</h2>
        <div className="div-border-color my-4"></div>
      </div>

      <div className="col-12">
        {!activeSection && renderCards()}
        {activeSection === 'myCourses' && (
          <div className={`camarote-section ${activeSection === 'myCourses' ? 'camarote-section-active' : ''}`}>
            <GestionarMisCursos user={user} onBack={handleBackClick} />
          </div>
        )}
      </div>
    </div>
  );
}
