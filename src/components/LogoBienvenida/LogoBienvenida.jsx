import "./LogoBienvenida.css";

export function LogoBienvenida() {
    return (
        <div class="d-flex flex-column align-items-center justify-content-center">
            <h1 class="d-none">LATIAS</h1>
            <img class="latiasLogo" src="./src/assets/latias.png" alt="Latias logo" />
            <div>
                <h2 class="mainTitle">Bienvenido a <strong class="text-white">Latias</strong>, la primer academia de cursos náuticos 100% en línea.</h2>
                <p class="subTitle">Aprendé a navegar con confianza desde cualquier lugar.</p>
            </div>
        </div>
    )
}