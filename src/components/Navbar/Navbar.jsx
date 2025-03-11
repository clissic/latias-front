import "./Navbar.css";
import { Link } from "react-router-dom";
import logoLatias from "../../assets/latias-horizontal.png";
import { useAuth } from "../../context/AuthContext.jsx";

export function Navbar() {
    const { isAuthenticated } = useAuth();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-none d-flex justify-content-between">
            <Link to="/" className="navbar-brand">
                <img className="img-fluid logoHorizontal" src={logoLatias} alt="logo Latias horizontal"/>
            </Link>
            <div>                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link to="/cursos" className="nav-item nav-link">Cursos</Link>
                        <Link to="/instructores" className="nav-item nav-link">Instructores</Link>
                        <Link to="/gestoria" className="nav-item nav-link">Gestoría</Link>
                        {isAuthenticated ? (
                            <Link to="/dashboard/general" className="nav-item nav-link btnPlataforma"><strong>MI LATIAS</strong></Link>
                        ) : (
                            <Link to="/login" className="nav-item nav-link btnPlataforma"><strong>PLATAFORMA</strong></Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}