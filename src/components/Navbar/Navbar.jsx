import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export function Navbar() {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Función para manejar clicks en links para usuarios checkin
    const handleLinkClick = (e, path) => {
        if (user?.category === "checkin" && path !== "/checkin") {
            e.preventDefault();
            navigate("/checkin", { replace: true });
        }
    };

    return (
        <nav id="goToTop" className="navbar navbar-expand-lg navbar-dark bg-none d-flex justify-content-between">
            <Link to="/" className="navbar-brand">
                <img className="img-fluid logoHorizontal" src="/latias-horizontal.png" alt="logo Latias horizontal"/>
            </Link>              
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse justify-content-md-end" id="navbarNavAltMarkup">
                <div className="navbar-nav">
                    {user?.category !== "checkin" && (
                        <>
                            <Link to="/cursos" className="nav-item nav-link">Cursos</Link>
                            <Link to="/instructores" className="nav-item nav-link">Instructores</Link>
                            <Link to="/gestoria" className="nav-item nav-link">Gestoría</Link>
                        </>
                    )}
                    {isAuthenticated ? (
                        user?.category === "checkin" ? (
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
    );
}