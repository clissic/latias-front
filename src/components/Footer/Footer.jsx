import "./Footer.css";

export function Footer() {
    return (
        <footer className="d-flex flex-column flex-md-row justify-items-between gap-3 gap-md-0 my-5">
            <div className="d-flex col-10 col-md-4 justify-content-center justify-content-md-start">
                <p className="derechosRes text-center text-md-start m-0">© 2026 Latias Academia. Todos los derechos reservados.</p>
            </div>
            <div className="d-flex col-10 col-md-4 justify-content-center socialMediaIcons">
                <a href="https://www.instagram.com/latias.app/" target="_blank"><i className="bi bi-instagram"></i></a>
                <a href="#" target="_blank"><i className="bi bi-facebook"></i></a>
                <a href="#" target="_blank"><i className="bi bi-tiktok"></i></a>
                <a href="#" target="_blank"><i className="bi bi-linkedin"></i></a>
            </div>
            <div className="col-10 col-md-4 justify-content-center justify-content-md-end logoJPCdiv">
                <a target="_blank" href="https://jpc-dev.uy"><img className="logoJPC" src="/LogoJPC.svg" alt="Logo JPC"/></a>
                <p>Desarrollado por <a target="_blank" href="https://jpc-dev.uy"><strong>JPC</strong></a>.</p>
            </div>
        </footer>
    )
}