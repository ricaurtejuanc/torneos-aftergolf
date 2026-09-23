import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { obtenerOrganizadorPorId } from "@/lib/data/organizador";
import { enviarEmailInscripcionConfirmada, enviarEmailInscripcionRecibida } from "@/lib/email";

export type EsperandoDetallado = {
  inscripcionId: string;
  nombreCompleto: string;
  email: string | null;
  handicap: number | null;
  licenciaFederativa: string | null;
  esSocio: boolean;
  precioCents: number;
  createdAt: string;
};

/** Jugadores en lista de espera de un torneo, en orden de llegada. */
export async function listarListaEspera(
  supabase: SupabaseClient<Database>,
  torneoId: string,
): Promise<EsperandoDetallado[]> {
  const { data } = await supabase
    .from("inscripciones")
    .select(
      "id, licencia_federativa, handicap_snapshot, es_socio, precio_cents, created_at, jugadores(nombre, apellidos, email, handicap, licencia_federativa)",
    )
    .eq("torneo_id", torneoId)
    .eq("estado", "en_lista_espera")
    .order("created_at", { ascending: true });

  type Fila = {
    id: string;
    licencia_federativa: string | null;
    handicap_snapshot: number | null;
    es_socio: boolean;
    precio_cents: number;
    created_at: string;
    jugadores: {
      nombre: string;
      apellidos: string;
      email: string | null;
      handicap: number | null;
      licencia_federativa: string | null;
    } | null;
  };

  return ((data ?? []) as unknown as Fila[]).map((f) => ({
    inscripcionId: f.id,
    nombreCompleto: f.jugadores ? `${f.jugadores.nombre} ${f.jugadores.apellidos}`.trim() : "Jugador",
    email: f.jugadores?.email ?? null,
    handicap: f.handicap_snapshot ?? f.jugadores?.handicap ?? null,
    licenciaFederativa: f.licencia_federativa ?? f.jugadores?.licencia_federativa ?? null,
    esSocio: f.es_socio,
    precioCents: f.precio_cents,
    createdAt: f.created_at,
  }));
}

/**
 * Da plaza a un jugador en lista de espera: crea su pedido de pago (o lo
 * confirma directamente si el torneo se paga en el club, igual que una
 * inscripción normal) y avisa por email. No comprueba cupo — quien llama
 * decide si toca (a mano, el admin decide; en automático,
 * `promoverSiguienteAutomatico` ya lo comprueba antes de llamar aquí).
 */
export async function promoverDeListaEspera(
  supabase: SupabaseClient<Database>,
  inscripcionId: string,
): Promise<{ ok: boolean; error: string | null }> {
  const { data: inscripcionRaw } = await supabase
    .from("inscripciones")
    .select(
      "id, torneo_id, jugador_id, precio_cents, estado, jugadores(nombre, apellidos, email), torneos(nombre, fecha, modo_pago, organizador_id)",
    )
    .eq("id", inscripcionId)
    .maybeSingle();

  const inscripcion = inscripcionRaw as unknown as {
    id: string;
    torneo_id: string;
    jugador_id: string;
    precio_cents: number;
    estado: string;
    jugadores: { nombre: string; apellidos: string; email: string | null } | null;
    torneos: {
      nombre: string;
      fecha: string;
      modo_pago: string;
      organizador_id: string | null;
    } | null;
  } | null;

  if (!inscripcion || inscripcion.estado !== "en_lista_espera" || !inscripcion.torneos) {
    return { ok: false, error: "Esta inscripción ya no está en lista de espera." };
  }

  const pagaEnClub = inscripcion.torneos.modo_pago === "club";

  const { data: pedido, error: errorPedido } = await supabase
    .from("pedidos_pago")
    .insert({
      user_id: null,
      torneo_id: inscripcion.torneo_id,
      metodo_pago: pagaEnClub ? "club" : "bizum",
      estado: pagaEnClub ? "confirmado" : "pendiente_confirmacion",
      total_cents: inscripcion.precio_cents,
      confirmado_at: pagaEnClub ? new Date().toISOString() : null,
    })
    .select("id")
    .single();
  if (errorPedido || !pedido) {
    return { ok: false, error: "No se ha podido crear el pedido de pago." };
  }

  const { error: errorUpdate } = await supabase
    .from("inscripciones")
    .update({
      estado: pagaEnClub ? "confirmada" : "pendiente_pago",
      pedido_pago_id: pedido.id,
    })
    .eq("id", inscripcionId);
  if (errorUpdate) return { ok: false, error: errorUpdate.message };

  const jugador = inscripcion.jugadores;
  if (jugador?.email) {
    const organizador = await obtenerOrganizadorPorId(supabase, inscripcion.torneos.organizador_id);
    const item = {
      torneoNombre: inscripcion.torneos.nombre,
      torneoFecha: inscripcion.torneos.fecha,
      precioCents: inscripcion.precio_cents,
    };
    const nombre = `${jugador.nombre} ${jugador.apellidos}`.trim();
    if (pagaEnClub) {
      await enviarEmailInscripcionConfirmada({ destinatario: jugador.email, nombre, items: [item], organizador });
    } else {
      await enviarEmailInscripcionRecibida({ destinatario: jugador.email, nombre, items: [item], organizador });
    }
  }

  return { ok: true, error: null };
}

/**
 * Si el torneo tiene lista_espera_automatica y se ha liberado una plaza,
 * promueve al primero de la lista de espera (orden de llegada). Se llama
 * después de cualquier cancelación que pueda liberar cupo.
 */
export async function promoverSiguienteAutomatico(
  supabase: SupabaseClient<Database>,
  torneoId: string,
): Promise<void> {
  const { data: torneo } = await supabase
    .from("torneos")
    .select("cupo_maximo, lista_espera_automatica")
    .eq("id", torneoId)
    .maybeSingle();
  if (!torneo?.lista_espera_automatica || torneo.cupo_maximo == null) return;

  const { data: cupo } = await supabase
    .from("torneos_cupo")
    .select("inscritos")
    .eq("torneo_id", torneoId)
    .maybeSingle();
  if ((cupo?.inscritos ?? 0) >= torneo.cupo_maximo) return;

  const { data: siguiente } = await supabase
    .from("inscripciones")
    .select("id")
    .eq("torneo_id", torneoId)
    .eq("estado", "en_lista_espera")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (!siguiente) return;

  await promoverDeListaEspera(supabase, siguiente.id);
}
