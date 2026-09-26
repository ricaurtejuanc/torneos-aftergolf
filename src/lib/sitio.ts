import "server-only";
import { headers } from "next/headers";

/**
 * URL base (protocolo + host) de la visita actual. Cada organizador tiene
 * su propio dominio, así que sitemap/robots no pueden llevar una URL fija:
 * se construyen con el host real de la petición.
 */
export async function urlBaseActual(): Promise<string> {
  const cabeceras = await headers();
  const host = cabeceras.get("x-forwarded-host") ?? cabeceras.get("host") ?? "localhost:3000";
  const protocolo =
    cabeceras.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocolo}://${host}`;
}

/** true en el dominio paraguas de la plataforma (landing de producto),
 * que no es el sitio de ningún organizador. Lo decide `proxy.ts`. */
export async function esDominioPlataforma(): Promise<boolean> {
  const cabeceras = await headers();
  return cabeceras.get("x-show-landing") === "1";
}
