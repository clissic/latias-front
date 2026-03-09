import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "../FadeIn/FadeIn";
import { apiService } from "../../services/apiService";
import { useAuth } from "../../context/AuthContext";
import Swal from "sweetalert2";
import "./Gestoria.css";

export function Gestoria() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContratarPlan = (planId) => {
    if (!user?.id && !user?._id) {
      Swal.fire({
        icon: "warning",
        title: "Inicia sesión",
        text: "Debes iniciar sesión para contratar un plan.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
      });
      return;
    }
    navigate(`/gestoria/buy/${planId}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.sendContactEmail(formData);

      if (response.status === "success") {
        Swal.fire({
          icon: "success",
          title: "¡Mensaje enviado!",
          text: response.msg || "Tu mensaje fue enviado exitosamente. Nos pondremos en contacto contigo pronto.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });

        // Limpiar el formulario
        setFormData({
          name: "",
          email: "",
          body: "",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: response.msg || "Ocurrió un error al enviar el mensaje. Por favor, intenta nuevamente.",
          confirmButtonText: "Aceptar",
          background: "#082b55",
          color: "#ffffff",
          customClass: {
            confirmButton: "custom-swal-button",
          },
        });
      }
    } catch (error) {
      console.error("Error al enviar mensaje:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Ocurrió un error al enviar el mensaje. Por favor, intenta nuevamente más tarde.",
        confirmButtonText: "Aceptar",
        background: "#082b55",
        color: "#ffffff",
        customClass: {
          confirmButton: "custom-swal-button",
        },
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="text-white mb-5">
      <FadeIn>
        <div className="text-center mt-5">
          <div className="mb-3">
            <i className="bi bi-folder-fill text-orange display-1"></i>
          </div>
          <h1 className="fw-bold">GESTORÍA</h1>
        </div>
        <div className="mt-5">
          <p className="text-center">
            Cada embarcación es más que un medio de transporte; es{" "}
            <strong>libertad, aventura y pasión</strong> por el mar. Pero detrás
            de cada travesía hay responsabilidades que no deberían ser una
            carga. Nuestra gestoría náutica está pensada para que disfrutes del
            agua sin preocupaciones, asegurándonos de que cada trámite se
            resuelva con eficiencia y respaldo. Sabemos que el tiempo en el mar
            es invaluable, por eso nos ocupamos de todo lo necesario para que
            solo pienses en navegar. Desde el primer documento hasta el último
            detalle, estamos para acompañarte en cada ola, asegurando que solo
            tengas que preocuparte por el viento y el horizonte.
          </p>
        </div>
      </FadeIn>
      <div className="container services-div mb-5">
        <FadeIn>
          <div className="d-flex flex-column justify-content-center align-items-start mt-5 gestoria-banner text-white w-100">
            <h2 className="index-sub-title">SIEMPRE PENSANDO EN VOS</h2>
            <h4>
              <strong>Nuestros servicios:</strong>
            </h4>
          </div>
        </FadeIn>
        <br></br>
        <div className="container mt-4">
          <div className="row">
            <div className="services-card mt-3 col-lg-4 col-md-6 col-12">
              <FadeIn>
                <div className="services-card-div">
                  <i className="bi bi-cash-coin text-orange"></i>
                  <h3>PAGO DE TRIBUTOS</h3>
                </div>
                <br></br>
                <p className="text-justify">
                  En nuestra gestoría náutica, no solo realizamos pagos de
                  tributos, brindamos tranquilidad y confianza. Cada trámite que
                  gestionamos es una garantía de que tu embarcación estará lista
                  para navegar sin preocupaciones, cumpliendo con todas las
                  obligaciones. Desde el momento en que confías en nosotros, te
                  aseguramos eficiencia y respaldo. Olvidate del papeleo y
                  concentrate en disfrutar del mar, el viento y esas travesías
                  que te esperan. Navegá tranquilo, nosotros nos encargamos del
                  resto.
                </p>
              </FadeIn>
            </div>
            <div className="services-card mt-3 col-lg-4 col-md-6 col-12">
              <FadeIn>
                <div className="services-card-div">
                  <i className="bi bi-file-earmark-check-fill text-orange"></i>
                  <h3>MATRICULACIONES</h3>
                </div>
                <br></br>
                <p className="text-justify">
                  Tu embarcación merece un comienzo sin complicaciones, y
                  nosotros nos encargamos de hacerlo realidad. La matriculación
                  no es solo un requisito, es el primer paso para que puedas
                  explorar el mar con total tranquilidad y respaldo. Nos
                  ocupamos de cada detalle, asegurando que cumplas con las
                  normativas mientras vos soñás con tus próximas travesías.
                  Confianos el trámite y dedicá tu tiempo a lo que realmente
                  importa: disfrutar de la libertad que el agua te ofrece.
                </p>
              </FadeIn>
            </div>
            <div className="services-card mt-3 col-lg-4 col-md-6 col-12">
              <FadeIn>
                <div className="services-card-div">
                  <i className="bi bi-passport-fill text-orange"></i>
                  <h3>PATENTES</h3>
                </div>
                <br></br>
                <p className="text-justify">
                  Para la gente de mar, tener los documentos al día es esencial
                  para navegar con tranquilidad y sin contratiempos. Nos
                  encargamos de todo el proceso de actualización, asegurando que
                  cada trámite se haga con rapidez y precisión, cumpliendo con
                  todos los requisitos legales. Así, podés enfocarte en lo que
                  realmente importa: tus travesías, tu carrera y tu conexión con
                  el mar, sabiendo que cada papel al día abre puertas a nuevas
                  oportunidades.
                </p>
              </FadeIn>
            </div>
            <div className="services-card mt-3 col-lg-4 col-md-6 col-12">
              <FadeIn>
                <div className="services-card-div">
                  <i className="bi bi-patch-check-fill text-orange"></i>
                  <h3>CERTIFICADOS</h3>
                </div>
                <br></br>
                <p className="text-justify">
                  Los certificados de tu barco no son solo documentos, son la
                  garantía de que tu embarcación cumple con todos los estándares
                  necesarios para navegar con seguridad y confianza. Nos
                  encargamos de gestionar su emisión de manera ágil y
                  profesional, asegurándonos de que todo esté en regla para que
                  puedas disfrutar del mar sin preocupaciones. Cada certificado
                  es un paso hacia nuevas travesías y aventuras, respaldando tu
                  compromiso con la navegación responsable. Confíanos este
                  trámite y centrate en lo que realmente importa: el placer de
                  navegar.
                </p>
              </FadeIn>
            </div>
            <div className="services-card mt-3 col-lg-4 col-md-6 col-12">
              <FadeIn>
                <div className="services-card-div">
                  <i className="bi bi-incognito text-orange"></i>
                  <h3>PERITAJES</h3>
                </div>
                <br></br>
                <p className="text-justify">
                  En casos de incidentes marítimos, conectar con los mejores
                  profesionales puede marcar la diferencia. Por eso, te ayudamos
                  a contactar con los peritos más reconocidos del país,
                  especialistas en brindar evaluaciones claras y confiables.
                  Nuestro objetivo es simplificar el proceso, asegurando que
                  cuentes con el respaldo adecuado para resolver cualquier
                  situación con tranquilidad. Vos ocupate de tu embarcación,
                  nosotros nos encargamos de acercarte a quienes mejor pueden
                  ayudarte.
                </p>
              </FadeIn>
            </div>
            <div className="services-card mt-3 col-lg-4 col-md-6 col-12">
              <FadeIn>
                <div className="services-card-div">
                  <i className="bi bi-shield-fill-plus text-orange"></i>
                  <h3>Y MÁS...</h3>
                </div>
                <br></br>
                <p className="text-justify">
                  Solicitud de duplicados de documentos, solicitud de botar y
                  varar, preparación para inspecciones de seguridad, seguimiento
                  de trámites, alerta sobre vencimientos, altas y bajas de
                  motores, cambios de propietarios, actualización de normativa,
                  gestión de infracciones, asesoramiento en compra y venta de
                  embarcaciones, gestión de embarcaciones extranjeras, permisos
                  de contrucción, certificados de equipos de comunicaciones,
                  gestión de seguros marítimos y mucho mas.
                </p>
              </FadeIn>
            </div>
            <div>
              <FadeIn>
                <div className="d-flex text-center my-4 justify-content-center">
                  <i className="bi bi-quote display-1 text-orange mt-4"></i>
                  <h3 className="mt-5 col-10">
                    En la gestoría de LATIAS, nuestra misión es hacer realidad
                    tus proyectos marítimos, ofreciendo servicios que no solo
                    sean eficientes y profesionales, sino que también se adapten
                    a tus necesidades y aspiraciones como nauta. Queremos que
                    cada trámite, desde la matriculación hasta los seguros, te
                    brinde la tranquilidad y el respaldo necesario para que
                    puedas disfrutar del mar con total confianza y seguridad.
                  </h3>
                  <i className="bi bi-quote display-1 text-orange transform-180"></i>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </div>
      <FadeIn>
        <div className="gestoria-planes-section container mb-5">
          <h2 className="gestoria-planes-title text-white mb-5" id="planes">
            <i className="bi bi-stars me-2 text-orange" aria-hidden="true" />
            PLANES
          </h2>
          <div className="row g-5 gestoria-planes-grid w-100 mx-0">
            <div className="col-12 col-lg-4">
              <div className="gestoria-plan-card">
                <div>
                  <i className="bi bi-briefcase-fill color-bronze icon-gestoria-plan" aria-hidden="true" />
                  <h2 className="">BÁSICO</h2>
                  <p className="gestoria-plan-card-title">Control náutico</p>
                  <div className="mt-3 d-flex align-items-center justify-content-center frow gap-2 flex-wrap">
                    <h1 className="text-orange gestoria-plan-card-price">249</h1>
                    <div className="d-flex flex-column justify-content-start">
                      <h5 className="text-white-50 mb-0">USD $</h5>
                      <h6 className="text-white-50 mb-0">/ año</h6>
                    </div>
                  </div>
                  <p className="text-white-50">IVA Inc.</p>
                  <div className="gestoria-plan-incluye mt-3 text-center w-100">
                    <h6 className="text-orange mb-2">Incluye:</h6>
                    <ul className="gestoria-plan-list mb-0">
                      <li className="mb-2">Contratación de gestor</li>
                      <li className="mb-2">Registro de hasta dos embarcaciones</li>
                      <li className="mb-2">Dos trámites anuales incluidos*</li>
                      <li className="mb-2">Monitoreo de vencimientos</li>
                      <li className="mb-2">Recordatorios automáticos</li>
                      <li className="mb-2">Preparación de inspecciones</li>
                      <li className="mb-2">Asesoramiento legal y técnico</li>
                      <li className="mb-2 text-white-50 text-decoration-line-through">Atención preferencial</li>
                      <li className="mb-2 text-white-50 text-decoration-line-through">Cursos gratis a elección</li>
                      <li className="mb-2 text-white-50 text-decoration-line-through">Gestión de incidentes marítimos</li>
                      <li className="mb-2 text-white-50 text-decoration-line-through">Asistencia en caso de infracciones</li>
                    </ul>
                  </div>
                </div>
                <div className="d-flex justify-content-center my-3">
                  <button
                    type="button"
                    className="btn btn-orange fw-bold"
                    onClick={() => handleContratarPlan("basico")}
                  >
                    CONTRATAR
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="gestoria-plan-card">
                <div>
                  <i className="bi bi-briefcase-fill color-silver icon-gestoria-plan" aria-hidden="true" />
                  <h2 className="">NAVEGANTE</h2>
                  <p className="gestoria-plan-card-title">Gestión activa</p>
                  <div className="mt-3 d-flex align-items-center justify-content-center frow gap-2 flex-wrap">
                    <h1 className="text-orange gestoria-plan-card-price">359</h1>
                    <div className="d-flex flex-column justify-content-start">
                      <h5 className="text-white-50 mb-0">USD $</h5>
                      <h6 className="text-white-50 mb-0">/ año</h6>
                    </div>
                  </div>
                  <p className="text-white-50">IVA Inc.</p>
                  <div className="gestoria-plan-incluye mt-3 text-center w-100">
                    <h6 className="text-orange mb-2">Incluye:</h6>
                    <ul className="gestoria-plan-list mb-0">
                      <li className="mb-2">Contratación de gestor</li>
                      <li className="mb-2">Registro de hasta cinco embarcaciones</li>
                      <li className="mb-2">Cinco trámites anuales incluidos*</li>
                      <li className="mb-2">Monitoreo de vencimientos</li>
                      <li className="mb-2">Recordatorios automáticos</li>
                      <li className="mb-2">Preparación de inspecciones</li>
                      <li className="mb-2">Asesoramiento legal y técnico</li>
                      <li className="mb-2">Atención preferencial</li>
                      <li className="mb-2">Un curso gratis a elección</li>
                      <li className="mb-2 text-white-50 text-decoration-line-through">Gestión de incidentes marítimos</li>
                      <li className="mb-2 text-white-50 text-decoration-line-through">Asistencia en caso de infracciones</li>
                    </ul>
                  </div>
                </div>
                <div className="d-flex justify-content-center my-3">
                  <button
                    type="button"
                    className="btn btn-orange fw-bold"
                    onClick={() => handleContratarPlan("navegante")}
                  >
                    CONTRATAR
                  </button>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="gestoria-plan-card">
                <div>
                  <i className="bi bi-briefcase-fill color-gold icon-gestoria-plan" aria-hidden="true" />
                  <h2 className="">CAPITÁN</h2>
                  <p className="gestoria-plan-card-title">Gestión total</p>
                  <div className="mt-3 d-flex align-items-center justify-content-center frow gap-2 flex-wrap">
                    <h1 className="text-orange gestoria-plan-card-price">699</h1>
                    <div className="d-flex flex-column justify-content-start">
                      <h5 className="text-white-50 mb-0">USD $</h5>
                      <h6 className="text-white-50 mb-0">/ año</h6>
                    </div>
                  </div>
                  <p className="text-white-50">IVA Inc.</p>
                  <div className="gestoria-plan-incluye mt-3 text-center w-100">
                    <h6 className="text-orange mb-2">Incluye:</h6>
                    <ul className="gestoria-plan-list mb-0">
                      <li className="mb-2">Contratación de gestor</li>
                      <li className="mb-2">Registro de hasta ocho embarcaciones</li>
                      <li className="mb-2">Diez trámites anuales incluidos*</li>
                      <li className="mb-2">Monitoreo de vencimientos</li>
                      <li className="mb-2">Recordatorios automáticos</li>
                      <li className="mb-2">Preparación de inspecciones</li>
                      <li className="mb-2">Asesoramiento legal y técnico</li>
                      <li className="mb-2">Dos cursos gratis a elección</li>
                      <li className="mb-2">Atención preferencial y prioritaria</li>
                      <li className="mb-2">Gestión de incidentes marítimos</li>
                      <li className="mb-2">Asistencia en caso de infracciones</li>
                    </ul>
                  </div>
                </div>
                <div className="d-flex justify-content-center my-3">
                  <button
                    type="button"
                    className="btn btn-orange fw-bold"
                    onClick={() => handleContratarPlan("capitan")}
                  >
                    CONTRATAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p className="text-white-50 text-center my-2">*Una vez utilizados los trámites incluidos en el plan, los siguientes trámites se abonarán individualmente.</p>
      </FadeIn>
      <FadeIn>
        <div id="contact">
          <h2 className="text-orange my-5">CONTACTANOS</h2>
          <div className="contact-div row">
            <form
              className="contact-subdiv text-white col-12 col-md-6"
              onSubmit={handleSubmit}
            >
              <div className="input-v1">
                <label htmlFor="gestoria-contact-name">Nombre: </label>
                <input
                  id="gestoria-contact-name"
                  className="text-white"
                  type="text"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="input-v1">
                <label htmlFor="gestoria-contact-email">Email: </label>
                <input
                  id="gestoria-contact-email"
                  className="text-white"
                  type="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                />
              </div>
              <div className="input-textarea">
                <label htmlFor="gestoria-contact-body">Texto: </label>
                <textarea
                  id="gestoria-contact-body"
                  className="text-white"
                  name="body"
                  autoComplete="off"
                  cols="80"
                  rows="2"
                  placeholder="Quiero saber más sobre..."
                  value={formData.body}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                ></textarea>
              </div>
              <div className="submit-cont col-12 col-md-4">
                <button type="submit" id="submit-btn" disabled={loading}>
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                        style={{ width: "1em", height: "1em", borderWidth: "0.15em" }}
                      ></span>
                      Enviando...
                    </>
                  ) : (
                    "ENVIAR"
                  )}
                </button>
              </div>
            </form>
            <div className="contact-subdiv personal-quote col-12 col-md-6 d-md-block p-0 d-none d-md-flex align-items-center justify-content-center">
              <img
                className="img-fluid"
                src="/logo-gestoria.png"
                alt="Latias logo gestoria"
              />
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
