import "./Bienvenida.css";
import { MsjBienvenida } from "../MsjBienvenida/MsjBienvenida";

export function Bienvenida() {
    return (
        <div className="d-flex flex-row align-items-center justify-content-center">
            <h1 className="d-none">LATIAS</h1>
            <MsjBienvenida />
            <div className="topBoat d-none d-lg-block">
                <img className="img-fluid" src="./src/assets/latiasImgLogo.png" alt="Logo Latias"/>
            </div>
        </div>
    )
}