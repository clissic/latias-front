import './MsjBienvenida.css';

export function MsjBienvenida () {
    return  (
            <div className="d-flex d-lg-block flex-column align-items-center col-12 col-lg-6">
                <i className="text-orange bi bi-chat-square-quote-fill text-white display-6 mx-2"></i>
                <br />
                <h1 className="mainTitle text-white text-center text-lg-start">Bienvenido/a a <strong className="text-orange">LATIAS</strong>, la primer academia de cursos náuticos 100% en línea.</h1>
                <p className="subTitle text-orange text-center text-lg-start">Aprendé a navegar con confianza desde cualquier lugar.</p>
            </div>
    )
}