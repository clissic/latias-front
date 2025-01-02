import "./Footer.css";

export function Footer() {
    return (
        <footer>
            <p class="derechosRes">© 2025 Latias Academia. Todos los derechos reservados.</p>
            <div class="socialMediaIcons">
                <a href="#" target="_blank"><i class="bi bi-instagram"></i></a>
                <a href="#" target="_blank"><i class="bi bi-facebook"></i></a>
                <a href="#" target="_blank"><i class="bi bi-tiktok"></i></a>
                <a href="#" target="_blank"><i class="bi bi-linkedin"></i></a>
            </div>
            <div class="logoJPCdiv">
                <a target="_blank" href="https://jpc-dev.uy"><img class="logoJPC" src="./src/assets/LogoJPC.svg" alt="Logo JPC"/></a>
                <p>Desarrollado por <a target="_blank" href="https://jpc-dev.uy"><strong>JPC</strong></a>.</p>
            </div>
        </footer>
    )
}