/**
 * Rangos por cantidad de cursos aprobados (progreso 100%).
 * Imágenes en public/ranks: bronce.webp, plata.webp, oro.webp, platino.webp, diamante.webp
 */
export const RANK_TIERS = [
  { minApproved: 0, maxApproved: 5, id: "bronce", title: "Bronce", description: "Recién embarcado en la travesía del aprendizaje, aprendiendo lo básico." },
  { minApproved: 6, maxApproved: 10, id: "plata", title: "Plata", description: "Navegante en crecimiento, consolidando conocimientos y ganando experiencia." },
  { minApproved: 11, maxApproved: 15, id: "oro", title: "Oro", description: "Marinero experimentado, con un recorrido sólido y múltiples logros." },
  { minApproved: 16, maxApproved: 20, id: "platino", title: "Platino", description: "Veterano del aprendizaje, destacando por su constancia y nivel alcanzado." },
  { minApproved: 21, maxApproved: Infinity, id: "diamante", title: "Diamante", description: "Maestro de la bitácora, máximo rango por su excelencia y dedicación." },
];

/**
 * Obtiene el rango actual según la cantidad de cursos aprobados.
 * @param {number} approvedCount - Número de cursos con progreso 100%
 * @returns {{ id: string, title: string, description: string, imagePath: string }}
 */
export function getRankByApprovedCourses(approvedCount) {
  const count = Math.max(0, Number(approvedCount) || 0);
  const tier = RANK_TIERS.find(
    (t) => count >= t.minApproved && count <= t.maxApproved
  ) || RANK_TIERS[0];
  return {
    id: tier.id,
    title: tier.title,
    description: tier.description,
    imagePath: `/ranks/${tier.id}.webp`,
  };
}
