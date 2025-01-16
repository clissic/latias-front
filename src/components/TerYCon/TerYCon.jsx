import "./TerYCon.css";

export function TerYCon() {
  return (
    <div className="text-white mt-5" id="tyc">
        <div className="text-center mb-3">
            <i className="bi bi-book-half display-1 text-orange"></i>
        </div>
      <div className="text-center mb-4">
        <h1 className="fw-bold">Términos y Condiciones</h1>
      </div>

      <section className="mb-5">
        <h2 className="h4">1. Introducción</h2>
        <p>
          Estos Términos y Condiciones (en adelante, "Términos") regulan el uso
          de la plataforma de educación en línea (en adelante, "la Plataforma")
          proporcionada por <strong>[Nombre de la Empresa]</strong>, con
          domicilio en <strong>[Dirección]</strong>, Uruguay. Al acceder o
          utilizar la Plataforma, usted (en adelante, "el Usuario") acepta
          cumplir con estos Términos.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h4">2. Servicios Ofrecidos</h2>
        <p>
          La Plataforma ofrece cursos en línea pregrabados en diversas
          disciplinas. Los cursos están disponibles para usuarios de todo el
          mundo, pero se rigen por las leyes y regulaciones de Uruguay.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h4">3. Registro y Acceso</h2>
        <ul>
          <li>
            <strong>Elegibilidad:</strong> El Usuario debe ser mayor de 18 años.
            Los menores de edad requieren autorización de un padre o tutor
            legal.
          </li>
          <li>
            <strong>Cuenta Personal:</strong> El Usuario debe proporcionar
            información veraz y mantener la confidencialidad de sus credenciales
            de acceso.
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h4">4. Uso de la Plataforma</h2>
        <ul>
          <li>
            <strong>Licencia de Uso:</strong> Se otorga al Usuario una licencia
            limitada, no exclusiva e intransferible para acceder a los cursos
            adquiridos.
          </li>
          <li>
            <strong>Prohibiciones:</strong> Está prohibido descargar,
            reproducir, distribuir o compartir el contenido de los cursos sin
            autorización expresa.
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h4">5. Pagos y Suscripciones</h2>
        <ul>
          <li>
            <strong>Precios:</strong> Los precios de los cursos se indican en la
            Plataforma y pueden estar sujetos a impuestos según la normativa
            uruguaya.
          </li>
          <li>
            <strong>Formas de Pago:</strong> Se aceptan pagos mediante tarjetas
            de crédito/débito y otros métodos especificados en la Plataforma.
          </li>
          <li>
            <strong>Renovación y Cancelación:</strong> Las suscripciones se
            renovarán automáticamente según lo indicado en el momento de la
            compra. El Usuario puede cancelar la suscripción en cualquier
            momento, pero no se realizarán reembolsos por períodos ya
            facturados.
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h4">6. Certificados</h2>
        <p>
          Al completar un curso, el Usuario recibirá un certificado digital de
          finalización, emitido por única vez. En caso de extravío, se podrá
          solicitar una constancia de participación, pero no se emitirá un nuevo
          certificado.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h4">7. Propiedad Intelectual</h2>
        <p>
          Todos los contenidos de la Plataforma, incluyendo videos, audios,
          materiales escritos y otros recursos, son propiedad de{" "}
          <strong>[Nombre de la Empresa]</strong> o de sus licenciantes y están
          protegidos por las leyes de propiedad intelectual.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h4">8. Responsabilidades del Usuario</h2>
        <ul>
          <li>
            <strong>Uso Adecuado:</strong> El Usuario se compromete a utilizar
            la Plataforma de manera conforme a la ley, la moral y el orden
            público.
          </li>
          <li>
            <strong>Contenido Generado por el Usuario:</strong> Cualquier
            contenido que el Usuario publique en la Plataforma no debe infringir
            derechos de terceros ni contener material ofensivo o ilegal.
          </li>
        </ul>
      </section>

      <section className="mb-5">
        <h2 className="h4">9. Limitación de Responsabilidad</h2>
        <p>
          <strong>[Nombre de la Empresa]</strong> no será responsable por daños
          directos o indirectos derivados del uso de la Plataforma, incluyendo,
          pero no limitado a, interrupciones del servicio, errores o pérdida de
          datos.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h4">10. Modificaciones</h2>
        <p>
          <strong>[Nombre de la Empresa]</strong> se reserva el derecho de
          modificar estos Términos en cualquier momento. Las modificaciones
          serán efectivas desde su publicación en la Plataforma.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h4">11. Legislación Aplicable y Jurisdicción</h2>
        <p>
          Estos Términos se rigen por las leyes de la República Oriental del
          Uruguay. Cualquier disputa derivada de estos Términos será sometida a
          la jurisdicción de los tribunales competentes en Montevideo, Uruguay.
        </p>
      </section>

      <section className="mb-5">
        <h2 className="h4">12. Contacto</h2>
        <p>
          Para cualquier consulta o reclamo relacionado con estos Términos, el
          Usuario puede contactar a <strong>[Nombre de la Empresa]</strong> a
          través del correo electrónico{" "}
          <strong>[correo electrónico de contacto]</strong>.
        </p>
      </section>
    </div>
  );
}
