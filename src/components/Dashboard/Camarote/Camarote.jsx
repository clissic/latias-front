import React, { useState } from "react";
import { GestionarMisCursos } from "./GestionarMisCursos";
import "./Camarote.css";

export function Camarote({ user }) {
  const [activeSection, setActiveSection] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
            <h4 className="text-white mb-3">Gestionar mis cursos asignados</h4>
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
