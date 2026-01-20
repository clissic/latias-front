import React, { useEffect, useState } from "react";
import { CartaInstructor } from "../CartaInstructor/CartaInstructor";
import { FadeIn } from "../FadeIn/FadeIn";
import "./Instructores.css";

export function Instructores() {
  const [allInstructors, setAllInstructors] = useState([]);
  const [randomInstructorOne, setRandomInstructorOne] = useState(null);
  const [randomInstructorTwo, setRandomInstructorTwo] = useState(null);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/clissic/latias-back/refs/heads/master/instructores.json"
    )
      .then((response) => response.json())
      .then((data) => {
        setAllInstructors(data);
        const randomIndexOne = Math.floor(Math.random() * data.length);
        let randomIndexTwo = Math.floor(Math.random() * data.length);
        while (randomIndexTwo === randomIndexOne) {
          randomIndexTwo = Math.floor(Math.random() * data.length);
        }
        setRandomInstructorOne(data[randomIndexOne]);
        setRandomInstructorTwo(data[randomIndexTwo]);
      })
      .catch((error) => console.error("Error fetching instructors:", error));
  }, []);

  return (
    <div className="text-white mb-5">
      <FadeIn>
        <div className="text-center mt-5">
            <div className="mb-3">
            <i className="bi bi-person-video3 text-orange display-1"></i>
            </div>
            <h1 className="fw-bold">INSTRUCTORES</h1>
        </div>
      </FadeIn>
      <FadeIn>
        <div className="my-5">
            <p className="text-center">
            Nuestros instructores son verdaderos profesionales de la náutica con
            años de experiencia en el mar y una dedicación inigualable a su
            oficio. Cada uno de ellos no solo posee un vasto conocimiento técnico,
            sino que también es un apasionado de la enseñanza y la navegación.
            Están profundamente comprometidos en brindarte la mejor experiencia de
            aprendizaje posible. Conocé a nuestros instructores y descubrí todo lo
            que tienen para ofrecerte. Desde lecciones teóricas hasta prácticas en
            el agua, te guiarán a lo largo de tu viaje náutico con paciencia y
            profesionalismo. Su amor por el mar y la navegación es contagioso, y
            su objetivo principal es compartir ese entusiasmo contigo. Te
            invitamos a unirte a nuestra comunidad y a aprender de los mejores en
            el campo. ¡Tu aventura en el mar empieza aquí!
            </p>
        </div>
      </FadeIn>
      <FadeIn>
        <div className="d-flex justify-content-center flex-column gap-5 gap-md-3 custom-margin">
            <h2 className="text-center mb-4">
                ¿Qué destaca a nuestros instructores?
            </h2>
            <div className="d-flex justify-content-center flex-column flex-md-row gap-5 gap-md-3 mt-5">
                <div className="text-center col-12 col-md-3">
                    <div className="text-orange mb-4">
                        <i className="bi bi-stopwatch-fill display-1"></i>
                    </div>
                    <div>
                        <h3>HABILIDAD Y DEDICACIÓN</h3>
                    </div>
                </div>
                <div className="text-center col-12 col-md-3">
                    <div className="text-orange mb-4">
                        <i className="bi bi-award-fill display-1"></i>
                    </div>
                    <div>
                        <h3>EXPERIENCIA COMPROBABLE</h3>
                    </div>
                </div>
                <div className="text-center col-12 col-md-3">
                    <div className="text-orange mb-4">
                        <i className="bi bi-chat-square-text-fill display-1"></i>
                    </div>
                    <div>
                        <h3>INSTRUCCIÓN PERSONALIZADA</h3>
                    </div>
                </div>
            </div>
        </div>
      </FadeIn>
      <FadeIn>
          <div>
            {randomInstructorOne ? (
            <div className="mt-5 d-flex justify-content-center align-items-center flex-wrap mb-5 gap-5 gap-md-3">
                <div className="col-12 col-md-8 col-lg-3 container services-div">
                <CartaInstructor
                    id={randomInstructorOne.id}
                    profileImage={randomInstructorOne.profileImage}
                    firstName={randomInstructorOne.firstName}
                    lastName={randomInstructorOne.lastName}
                    profession={randomInstructorOne.profession}
                    experience={randomInstructorOne.experience}
                    socialMedia={randomInstructorOne.socialMedia}
                />
                </div>
                <div className="text-justify col-12 col-md-12 col-lg-7">
                <h2 className="text-orange mb-5">Habilidad y dedicación:</h2>
                <p>
                    Nuestros instructores son el pilar fundamental de la academia
                    náutica. Con una amplia trayectoria en el mundo marítimo,
                    combinan experiencia, conocimiento y pasión por la enseñanza
                    para brindar una formación de primer nivel. Cada uno de ellos ha
                    navegado extensamente, enfrentando los desafíos del mar y
                    adquiriendo habilidades que ahora transmiten con dedicación a
                    nuestros alumnos.
                </p>
                <p>
                    Su excelencia no solo radica en su dominio técnico, sino también
                    en su compromiso con la seguridad, la precisión y el aprendizaje
                    práctico. A través de métodos innovadores y un enfoque
                    personalizado, guían a cada estudiante para que desarrolle
                    confianza y destreza en la navegación.
                </p>
                <p>
                    En nuestra academia, la excelencia no es solo un objetivo, sino
                    un estándar. Con el respaldo de nuestros instructores, cada
                    alumno recibe una educación integral que lo prepara para
                    enfrentar el mar con seguridad, responsabilidad y determinación.
                    ¡Tu formación comienza con los mejores!
                </p>
                </div>
            </div>
            ) : (
                <p className="loading-text">Cargando instructores...</p>
            )}
        </div>
      </FadeIn>
      <FadeIn>
        <div>
            {randomInstructorTwo ? (
            <div className="mt-5 d-flex justify-content-center align-items-center flex-wrap mb-5 gap-5 gap-md-3">
                <div className="text-justify col-12 col-md-12 col-lg-7">
                <h2 className="text-orange mb-5">Experiencia comprobable:</h2>
                <p>
                    En nuestra academia náutica, la experiencia comprobable de
                    nuestros instructores es un pilar fundamental para garantizar
                    una enseñanza de calidad. Cada uno de ellos cuenta con una
                    sólida trayectoria en el ámbito marítimo, respaldada por
                    certificaciones oficiales y años de trabajo en la industria.
                </p>
                <p>
                    Su profundo conocimiento teórico les permite transmitir
                    conceptos clave de navegación, reglamentación marítima,
                    meteorología y seguridad con total claridad. Además, su
                    experiencia práctica en el sector les otorga una visión realista
                    y aplicada, enriqueciendo cada curso con ejemplos concretos y
                    situaciones reales.
                </p>
                <p>
                    Aprender con profesionales altamente capacitados te asegura
                    recibir información actualizada, precisa y alineada con las
                    normativas vigentes. Gracias a su trayectoria, nuestros
                    instructores pueden guiarte en cada paso de tu formación,
                    brindándote las herramientas necesarias para desarrollar un
                    conocimiento sólido desde la comodidad de tu computadora.
                </p>
                </div>
                <div className="col-12 col-md-8 col-lg-3 container services-div">
                <CartaInstructor
                    id={randomInstructorTwo.id}
                    profileImage={randomInstructorTwo.profileImage}
                    firstName={randomInstructorTwo.firstName}
                    lastName={randomInstructorTwo.lastName}
                    profession={randomInstructorTwo.profession}
                    experience={randomInstructorTwo.experience}
                    socialMedia={randomInstructorTwo.socialMedia}
                />
                </div>
            </div>
            ) : (
            <p className="loading-text">Cargando instructores...</p>
            )}
        </div>
      </FadeIn>
      <FadeIn>
        <div className="text-justify col-12">
            <h2 className="text-orange mb-5">Instrucción personalizada:</h2>
            <p>
            En nuestra academia náutica, ofrecemos una instrucción verdaderamente
            personalizada, permitiendo que cada estudiante avance a su propio
            ritmo con el respaldo directo de nuestros instructores. A través de WhatsApp y
            correo electrónico, los alumnos pueden realizar consultas, aclarar
            dudas y recibir orientación específica sobre los contenidos del curso.
            </p>
            <p>
            Este sistema garantiza una comunicación fluida y profesional,
            asegurando que cada estudiante obtenga respuestas detalladas y
            precisas por parte de nuestros expertos. Nuestro equipo de
            instructores está comprometido con brindar un seguimiento cercano,
            ofreciendo explicaciones adicionales y material complementario cuando
            sea necesario.
            </p>
            <p>
            Con esta metodología, combinamos la flexibilidad del aprendizaje en
            línea con la ventaja de una asistencia personalizada, para que cada
            alumno pueda adquirir conocimientos sólidos con el apoyo constante de
            profesionales altamente capacitados. ¡Descubre la diferencia de una
            instrucción personalizada con nuestros instructores!
            </p>
        </div>
      </FadeIn>
      <FadeIn>
        <div className="img-inst-end"></div>
      </FadeIn>
      <p className="text-secondary text-end mt-5">
        <strong>AVISO:</strong> Los instructores que aparecen en este apartado son elegidos
        aleatoriamente por la aplicación.
      </p>
    </div>
  );
}
