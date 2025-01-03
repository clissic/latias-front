import "./Navbar.css";

export function Navbar() {
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-none d-flex justify-content-between">
            <a className="navbar-brand" href="#"><img className="img-fluid logoHorizontal" src="./src/assets/latias-horizontal.png" alt="logo Latias horizontal"/></a>
            <div>                
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav">
                        <a className="nav-item nav-link" href="#">Cursos</a>
                        <a className="nav-item nav-link" href="#">Instructores</a>
                        <a className="nav-item nav-link btnPlataforma" href="#"><strong>PLATAFORMA</strong></a>
                    </div>
                </div>
            </div>
        </nav>
    )
}