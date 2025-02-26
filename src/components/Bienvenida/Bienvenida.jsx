import "./Bienvenida.css";
import { MsjBienvenida } from "../MsjBienvenida/MsjBienvenida";
import { FadeIn } from "../FadeIn/FadeIn";

export function Bienvenida() {
  return (
    <FadeIn>
      <div className="d-flex flex-lg-row flex-column gap-lg-5 align-items-center justify-content-center">
        <h1 className="d-none">LATIAS</h1>
        <div className="topBoat d-lg-none d-block w-50 my-5">
          <img
            className="img-fluid"
            src="./src/assets/tall-ship.png"
            alt="Logo Latias"
          />
        </div>
        <MsjBienvenida />
        <div className="topBoat d-none d-lg-block">
          <img
            className="img-fluid"
            src="./src/assets/tall-ship.png"
            alt="Logo Latias"
          />
        </div>
      </div>
    </FadeIn>
  );
}
