import "./Navbar.css";

export function Navbar() {
    return (
        <nav class="navbar navbar-expand-lg navbar-dark bg-none d-flex justify-content-between">
            <a class="navbar-brand" href="#"><img class="img-fluid logoHorizontal" src="./src/assets/latias-horizontal.png" alt="logo Latias horizontal"/></a>
            <div>                
                <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div class="navbar-nav">
                    <a class="nav-item nav-link" href="#">Cursos</a>
                    <a class="nav-item nav-link" href="#">Instructores</a>
                    <a class="nav-item nav-link btnPlataforma" href="#"><strong>PLATAFORMA</strong></a>
                    </div>
                </div>
            </div>
        </nav>
    )
}