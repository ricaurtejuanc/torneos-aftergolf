/**
 * Genera la escala completa de verdes (950...50, igual que la de AJAG en
 * globals.css) a partir de un único color de marca (`color_primario` de un
 * organizador, pensado como el tono "700": el que más se usa en botones y
 * enlaces). Así cada organizador no tiene que definir 8 tonos a mano — solo
 * elige un color y se deriva el resto ajustando la luminosidad en el mismo
 * matiz/saturación, con el mismo patrón de luminosidad que ya usa la
 * paleta de AJAG codificada a mano.
 */

type Hsl = { h: number; s: number; l: number };

function hexAHsl(hex: string): Hsl | null {
  const limpio = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(limpio)) return null;

  const r = parseInt(limpio.slice(0, 2), 16) / 255;
  const g = parseInt(limpio.slice(2, 4), 16) / 255;
  const b = parseInt(limpio.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }

  return { h, s: s * 100, l: l * 100 };
}

// Luminosidad (L de HSL) de cada tono en la paleta ajag-verde-* actual,
// para que la escala derivada tenga el mismo "salto" entre tonos.
const TONOS: { clave: "950" | "900" | "800" | "700" | "600" | "500" | "100" | "50"; l: number; satFactor: number }[] = [
  { clave: "950", l: 11, satFactor: 1 },
  { clave: "900", l: 15, satFactor: 1 },
  { clave: "800", l: 21, satFactor: 1 },
  { clave: "700", l: 29, satFactor: 1 },
  { clave: "600", l: 34, satFactor: 1 },
  { clave: "500", l: 40, satFactor: 0.95 },
  { clave: "100", l: 89, satFactor: 0.35 },
  { clave: "50", l: 96, satFactor: 0.2 },
];

// Luminancia relativa (WCAG) de un color HSL, para comprobar contraste.
function luminanciaHsl(h: number, s: number, l: number): number {
  const sat = s / 100;
  const lum = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sat * Math.min(lum, 1 - lum);
  const canal = (n: number) => lum - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const lineal = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lineal(canal(0)) + 0.7152 * lineal(canal(8)) + 0.0722 * lineal(canal(4));
}

// Contraste mínimo (WCAG AA, texto normal) del texto blanco sobre los tonos
// oscuros: botones y badges usan text-white sobre 500-950. Con la misma L
// de HSL, un matiz claro (amarillo, cian...) queda mucho más luminoso que un
// verde, así que esos tonos se oscurecen hasta llegar a 4.5:1.
const CONTRASTE_MINIMO_BLANCO = 4.5;

export function generarEscalaVerde(colorBase: string): Record<string, string> | null {
  const hsl = hexAHsl(colorBase);
  if (!hsl) return null;

  const escala: Record<string, string> = {};
  for (const tono of TONOS) {
    const s = Math.min(85, Math.max(20, hsl.s * tono.satFactor));
    let l = tono.l;
    if (tono.l < 50) {
      while (l > 5 && 1.05 / (luminanciaHsl(hsl.h, s, l) + 0.05) < CONTRASTE_MINIMO_BLANCO) l -= 1;
    }
    escala[tono.clave] = `hsl(${hsl.h.toFixed(1)} ${s.toFixed(1)}% ${l}%)`;
  }
  return escala;
}
