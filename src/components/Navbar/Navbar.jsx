import "./Navbar.css";
import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-none d-flex justify-content-between">
            <Link to="/" className="navbar-brand"><img className="img-fluid logoHorizontal" src="./src/assets/latias-horizontal.png" alt="logo Latias horizontal"/></Link>
            <div>                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <Link to="/cursos" className="nav-item nav-link">Cursos</Link>
                        <a className="nav-item nav-link" href="#">Instructores</a>
                        <Link to="/login" className="nav-item nav-link btnPlataforma"><strong>PLATAFORMA</strong></Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}