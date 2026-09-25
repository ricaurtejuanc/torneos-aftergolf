import "server-only";
import { obtenerOrganizadorActual } from "@/lib/data/organizador";
import { obtenerDatosLegales } from "@/lib/data/configuracion";
import { esDominioPlataforma } from "@/lib/sitio";

/** Fecha de la última revisión de los textos legales (mostrada en cada página). */
export const TEXTOS_LEGALES_ACTUALIZADOS = "25 de septiembre de 2026";

export type TitularLegal = {
  /** Nombre comercial que se ve en la web. */
  nombre: string;
  razonSocial: string | null;
  nif: string | null;
  domicilio: string | null;
  email: string | null;
  /** true si el sitio es el de un organizador (club/asociación) que usa la
   * plataforma AfterGolf Torneos; false en el dominio de la propia plataforma. */
  esOrganizador: boolean;
};

/**
 * Quién es el titular del sitio que se está visitando: en el dominio de la
 * plataforma, AfterGolf; en el de un club, ese organizador (con los datos
 * legales que haya rellenado en /admin/configuracion).
 */
export async function obtenerTitularLegal(): Promise<TitularLegal> {
  if (await esDominioPlataforma()) {
    return {
      nombre: "AfterGolf Torneos",
      razonSocial: null,
      nif: null,
      domicilio: null,
      email: "info@aftergolf.es",
      esOrganizador: false,
    };
  }

  const [organizador, datos] = await Promise.all([obtenerOrganizadorActual(), obtenerDatosLegales()]);
  return {
    nombre: organizador?.nombre ?? "AJAG Golf",
    razonSocial: datos?.razon_social || null,
    nif: datos?.nif || null,
    domicilio: datos?.domicilio || null,
    email: organizador?.email_contacto ?? null,
    esOrganizador: true,
  };
}
