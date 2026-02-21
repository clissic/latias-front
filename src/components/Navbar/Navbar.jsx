import { useState } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { hasCategory } from "../../utils/userCategory";

export function Navbar() {
    const { isAuthenticated, user, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [cursosLoading, setCursosLoading] = useState(false);

    // Función para manejar clicks en links para usuarios checkin
    const handleLinkClick = (e, path) => {
        if (hasCategory(user, "checkin") && path !== "/checkin") {
            e.preventDefault();
            navigate("/checkin", { replace: true });
        }
    };

    // Al hacer clic en Cursos: actualizar user (purchasedCourses) y luego navegar
    const handleCursosClick = (e) => {
        if (!isAuthenticated) return;
        e.preventDefault();
        setCursosLoading(true);
        refreshUser()
            .catch(() => {})
            .finally(() => {
                setCursosLoading(false);
                navigate("/cursos");
            });
    };

    return (
        <>
        {cursosLoading && (
            <div
                className="cursos-navbar-overlay"
                aria-hidden="true"
            >
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        )}
        <nav id="goToTop" className="navbar navbar-expand-lg navbar-dark bg-none d-flex justify-content-between">
            <Link to="/" className="navbar-brand">
                <img className="img-fluid logoHorizontal" src="/latias-horizontal.png" alt="logo Latias horizontal"/>
            </Link>              
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-md-end" id="navbarNavAltMarkup">
                <div className="navbar-nav">
                    {!hasCategory(user, "checkin") && (
                        <>
                            <Link to="/cursos" className="nav-item nav-link" onClick={isAuthenticated ? handleCursosClick : undefined}>Cursos</Link>
                            <Link to="/instructores" className="nav-item nav-link">Instructores</Link>
                            <Link to="/gestoria" className="nav-item nav-link">Gestoría</Link>
                        </>
                    )}
                    {isAuthenticated ? (
                        hasCategory(user, "checkin") ? (
                            <Link to="/checkin" className="nav-item nav-link btnPlataforma" onClick={(e) => handleLinkClick(e, "/checkin")}><strong>CHECK-IN</strong></Link>
                        ) : (
                            <Link to="/dashboard/general" className="nav-item nav-link btnPlataforma" onClick={(e) => handleLinkClick(e, "/dashboard/general")}><strong>MI LATIAS</strong></Link>
                        )
                    ) : (
                        <Link to="/login" className="nav-item nav-link btnPlataforma"><strong>PLATAFORMA</strong></Link>
                    )}
                </div>
            </div>
        </nav>
        </>
    );
}