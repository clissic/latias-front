import "./Footer.css";

export function Footer() {
    return (
        <footer>
            <p className="derechosRes">© 2025 Latias Academia. Todos los derechos reservados.</p>
            <div className="socialMediaIcons">
                <a href="#" target="_blank"><i className="bi bi-instagram"></i></a>
                <a href="#" target="_blank"><i className="bi bi-facebook"></i></a>
                <a href="#" target="_blank"><i className="bi bi-tiktok"></i></a>
                <a href="#" target="_blank"><i className="bi bi-linkedin"></i></a>
            </div>
            <div className="logoJPCdiv">
                <a target="_blank" href="https://jpc-dev.uy"><img className="logoJPC" src="./src/assets/LogoJPC.svg" alt="Logo JPC"/></a>
                <p>Desarrollado por <a target="_blank" href="https://jpc-dev.uy"><strong>JPC</strong></a>.</p>
            </div>
        </footer>
    )
}