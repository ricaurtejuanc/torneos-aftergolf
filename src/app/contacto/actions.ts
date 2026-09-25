"use server";

import { createClient } from "@/lib/supabase/server";
import { enviarEmailNuevaConsulta } from "@/lib/email";
import { obtenerOrganizadorActual } from "@/lib/data/organizador";
import { esEnvioSospechoso } from "@/lib/antispam";

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type EstadoContacto = { ok: boolean; error: string | null };

export async function enviarConsulta(
  _prevState: EstadoContacto,
  formData: FormData,
): Promise<EstadoContacto> {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim() || null;
  const mensaje = String(formData.get("mensaje") ?? "").trim();

  // A un bot se le responde como si todo hubiera ido bien, para no darle
  // pistas; simplemente no se guarda ni se notifica nada.
  if (esEnvioSospechoso(formData, 3000)) return { ok: true, error: null };

  if (!nombre || !email || !mensaje) {
    return { ok: false, error: "Rellena nombre, email y mensaje." };
  }
  if (!EMAIL_VALIDO.test(email) || email.length > 200) {
    return { ok: false, error: "Introduce un email válido." };
  }
  if (nombre.length > 120 || (telefono?.length ?? 0) > 30 || mensaje.length > 5000) {
    return { ok: false, error: "Alguno de los campos es demasiado largo." };
  }
  if (mensaje.length < 10) {
    return { ok: false, error: "El mensaje es demasiado corto." };
  }

  // Según el dominio por el que llega la visita: para quién es la consulta
  // (columna organizador_id) y a qué dirección se notifica.
  const organizador = await obtenerOrganizadorActual();

  const supabase = await createClient();
  const { error } = await supabase
    .from("consultas_contacto")
    .insert({ nombre, email, telefono, mensaje, organizador_id: organizador?.id ?? null });

  if (error) return { ok: false, error: "No se pudo enviar. Inténtalo de nuevo." };

  await enviarEmailNuevaConsulta({ nombre, email, telefono, mensaje, organizador });

  return { ok: true, error: null };
}
