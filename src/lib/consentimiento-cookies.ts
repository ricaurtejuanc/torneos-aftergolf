"use client";

import { useSyncExternalStore } from "react";

/**
 * Elección del visitante sobre las cookies de analítica, guardada en
 * localStorage (no en cookie: solo la lee el navegador) y válida 12 meses,
 * como recomienda la AEPD antes de volver a preguntar.
 */
export type ConsentimientoCookies = "aceptadas" | "rechazadas";

const CLAVE = "cookies-consentimiento";
const VALIDEZ_MS = 365 * 24 * 60 * 60 * 1000;

const suscriptores = new Set<() => void>();
// Reabrir el banner desde "Configurar cookies" sin borrar la elección previa.
let reabierto = false;
// Respaldo si localStorage no está disponible (modo privado estricto).
let eleccionEnMemoria: ConsentimientoCookies | null = null;

function avisar() {
  for (const suscriptor of suscriptores) suscriptor();
}

function leer(): ConsentimientoCookies | null {
  try {
    const raw = window.localStorage.getItem(CLAVE);
    if (!raw) return null;
    const { valor, fecha } = JSON.parse(raw) as { valor?: string; fecha?: number };
    if (typeof fecha !== "number" || Date.now() - fecha > VALIDEZ_MS) return null;
    return valor === "aceptadas" || valor === "rechazadas" ? valor : null;
  } catch {
    return null;
  }
}

export function guardarConsentimiento(valor: ConsentimientoCookies) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({ valor, fecha: Date.now() }));
  } catch {
    // Sin almacenamiento: la elección vale solo para esta visita.
    eleccionEnMemoria = valor;
  }
  reabierto = false;
  avisar();
}

export function reabrirBannerCookies() {
  reabierto = true;
  avisar();
}

function suscribir(suscriptor: () => void) {
  suscriptores.add(suscriptor);
  window.addEventListener("storage", suscriptor);
  return () => {
    suscriptores.delete(suscriptor);
    window.removeEventListener("storage", suscriptor);
  };
}

// Snapshot como string para que sea estable entre llamadas.
function snapshot(): string {
  return `${leer() ?? eleccionEnMemoria ?? "pendiente"}|${reabierto ? "reabierto" : ""}`;
}

/** En el servidor aún no se sabe nada: no se pinta banner ni analítica. */
function snapshotServidor(): string {
  return "servidor|";
}

export function useConsentimientoCookies(): {
  /** null mientras no se conoce (render en servidor / antes de hidratar). */
  consentimiento: ConsentimientoCookies | "pendiente" | null;
  mostrarBanner: boolean;
} {
  const [estado, marca] = useSyncExternalStore(suscribir, snapshot, snapshotServidor).split("|");
  if (estado === "servidor") return { consentimiento: null, mostrarBanner: false };
  const consentimiento = estado as ConsentimientoCookies | "pendiente";
  return { consentimiento, mostrarBanner: consentimiento === "pendiente" || marca === "reabierto" };
}
