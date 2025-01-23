import React from "react";
import { GrillaCursos } from "../GrillaCursos/GrillaCursos";

export function Cursos() {
  return (
    <div>
        <h6 className="text-warning">INSCRIBITE AHORA</h6>
      <h1 className="text-white mb-5">Explorá todos nuestros cursos:</h1>
        <GrillaCursos />
    </div>
  );
}