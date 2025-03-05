import React from "react";
import "./Eventos.css";

export function Eventos() {
  const eventos = [
    {
      id: 1,
      title: "Regata Internacional de Vela",
      date: "2025-03-15",
      hour: "10:00",
      description: "Competencia de vela con participantes de todo el mundo.",
      location: "Punta del Este, Uruguay",
      speaker: {
        name: "Juan Pérez",
        position: "Licenciado en Deportes Náuticos",
    },
    },
    {
      id: 2,
      title: "Charla sobre Seguridad Náutica",
      date: "2025-04-10",
      hour: "18:00",
      description:
        "Charla sobre protocolos de seguridad en la navegación y prevención de accidentes.",
      location: "Academia Virtual Náutica",
      speaker: {
        name: "María Rodríguez",
        position: "Capitana de Ultramar",
      },
    },
    {
      id: 3,
      title: "Simposio sobre Seguridad Marítima",
      date: "2025-05-20",
      hour: "09:00",
      description:
        "Evento enfocado en normativas y procedimientos de seguridad en el mar.",
      location: "Montevideo, Uruguay",
      speaker: {
        name: "Pedro Gómez", 
        position: "Oficial de Marina"},
    },
  ];

  return (
    <div className="text-white col-12 col-lg-11 d-flex flex-column align-items-between container">
      <div className="col-12">
        <h2 className="mb-4 text-orange">Eventos:</h2>
        {eventos.length === 0 ? (
          <div className="text-center my-5 d-flex flex-column align-items-center col-11">
            <i className="bi bi-binoculars-fill mb-4 custom-display-1 text-orange"></i>
            <h3>¡No hay eventos próximos!</h3>
            <p className="fst-italic">
              ¡Estamos a la espera de que te animes a participar en uno!
            </p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {eventos.map((evento) => (
              <div
                key={evento.id}
                className="dashboard-item-build-eventos container d-flex flex-column flex-lg-row gap-4 align-items-center justify-content-between"
              >
                <div className="col-12 col-lg-2 d-flex justify-content-center">
                  <i className="bi bi-calendar2-event-fill text-orange custom-display-1"></i>
                </div>
                <div className="col-12 col-lg-6">
                  <h3>{evento.title}</h3>
                  <p className="m-0">{evento.description}</p>
                  <p className="m-0">Fecha: {evento.date}</p>
                  <p className="m-0">Hora: {evento.hour}</p>
                  <p className="m-0">Ubicación: {evento.location}</p>
                  <p className="m-0">Orador: {evento.speaker.name}, {evento.speaker.position}</p>
                </div>
                <div className="col-5 col-lg-2 d-flex flex-column justify-content-center">
                  <button className="h-auto btn btn-warning">Agenda</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
