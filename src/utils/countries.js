// Lista de países con códigos ISO y emojis de banderas (Twemoji en index.html)
export const countries = [
  { code: "UY", name: "Uruguay", flag: "🇺🇾" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "BR", name: "Brasil", flag: "🇧🇷" },
  { code: "PY", name: "Paraguay", flag: "🇵🇾" },
  { code: "BO", name: "Bolivia", flag: "🇧🇴" },
  { code: "CL", name: "Chile", flag: "🇨🇱" },
  { code: "PE", name: "Perú", flag: "🇵🇪" },
  { code: "EC", name: "Ecuador", flag: "🇪🇨" },
  { code: "CO", name: "Colombia", flag: "🇨🇴" },
  { code: "VE", name: "Venezuela", flag: "🇻🇪" },
  { code: "GY", name: "Guyana", flag: "🇬🇾" },
  { code: "SR", name: "Surinam", flag: "🇸🇷" },
  { code: "GF", name: "Guayana Francesa", flag: "🇬🇫" },
  { code: "US", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "CA", name: "Canadá", flag: "🇨🇦" },
  { code: "MX", name: "México", flag: "🇲🇽" },
  { code: "CU", name: "Cuba", flag: "🇨🇺" },
  { code: "JM", name: "Jamaica", flag: "🇯🇲" },
  { code: "HT", name: "Haití", flag: "🇭🇹" },
  { code: "DO", name: "República Dominicana", flag: "🇩🇴" },
  { code: "PR", name: "Puerto Rico", flag: "🇵🇷" },
  { code: "BS", name: "Bahamas", flag: "🇧🇸" },
  { code: "PA", name: "Panamá", flag: "🇵🇦" },
  { code: "CR", name: "Costa Rica", flag: "🇨🇷" },
  { code: "NI", name: "Nicaragua", flag: "🇳🇮" },
  { code: "HN", name: "Honduras", flag: "🇭🇳" },
  { code: "SV", name: "El Salvador", flag: "🇸🇻" },
  { code: "GT", name: "Guatemala", flag: "🇬🇹" },
  { code: "BZ", name: "Belice", flag: "🇧🇿" },
  { code: "ES", name: "España", flag: "🇪🇸" },
  { code: "PT", name: "Portugal", flag: "🇵🇹" },
  { code: "FR", name: "Francia", flag: "🇫🇷" },
  { code: "IT", name: "Italia", flag: "🇮🇹" },
  { code: "DE", name: "Alemania", flag: "🇩🇪" },
  { code: "GB", name: "Reino Unido", flag: "🇬🇧" },
  { code: "NL", name: "Países Bajos", flag: "🇳🇱" },
  { code: "BE", name: "Bélgica", flag: "🇧🇪" },
  { code: "GR", name: "Grecia", flag: "🇬🇷" },
  { code: "TR", name: "Turquía", flag: "🇹🇷" },
  { code: "RU", name: "Rusia", flag: "🇷🇺" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "JP", name: "Japón", flag: "🇯🇵" },
  { code: "KR", name: "Corea del Sur", flag: "🇰🇷" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "NZ", name: "Nueva Zelanda", flag: "🇳🇿" },
  { code: "ZA", name: "Sudáfrica", flag: "🇿🇦" },
  { code: "EG", name: "Egipto", flag: "🇪🇬" },
  { code: "MA", name: "Marruecos", flag: "🇲🇦" },
  { code: "AE", name: "Emiratos Árabes Unidos", flag: "🇦🇪" },
  { code: "SA", name: "Arabia Saudí", flag: "🇸🇦" },
  { code: "IL", name: "Israel", flag: "🇮🇱" },
  { code: "TH", name: "Tailandia", flag: "🇹🇭" },
  { code: "SG", name: "Singapur", flag: "🇸🇬" },
  { code: "MY", name: "Malasia", flag: "🇲🇾" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩" },
  { code: "PH", name: "Filipinas", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳" },
];

export function getCountryByCode(code) {
  if (!code) return null;
  const c = String(code).trim().toUpperCase();
  return countries.find((country) => country.code === c) || null;
}

export function getCountryByName(name) {
  if (!name) return null;
  const n = String(name).trim().toLowerCase();
  return countries.find((country) => country.name.toLowerCase() === n) || null;
}

/** Obtiene la bandera por código ISO (ej. "UY") o nombre de país (ej. "Uruguay") */
export function getCountryFlag(countryValue) {
  const country = getCountry(countryValue);
  return country ? country.flag : null;
}

/** Obtiene el objeto país { code, name, flag } por código ISO o nombre */
export function getCountry(countryValue) {
  if (!countryValue) return null;
  const byCode = getCountryByCode(countryValue);
  if (byCode) return byCode;
  return getCountryByName(countryValue);
}

/** Jurisdicciones disponibles para asignar gestor (orden: Uruguay, Argentina, Chile, Perú, Bolivia, Ecuador, Colombia, Venezuela, Brasil, México, Panamá, El Salvador) */
export const JURISDICTION_CODES = ["UY", "AR", "CL", "PE", "BO", "EC", "CO", "VE", "BR", "MX", "PA", "SV"];

export function getJurisdictions() {
  return JURISDICTION_CODES.map((code) => getCountryByCode(code)).filter(Boolean);
}
