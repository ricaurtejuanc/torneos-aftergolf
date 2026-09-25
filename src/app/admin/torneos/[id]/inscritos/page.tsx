import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listarInscritosDetallados } from "@/lib/data/inscripciones";
import { listarListaEspera } from "@/lib/data/lista-espera";
import { formatearPrecio, formatearFechaCorta } from "@/lib/format";
import { ExportarXlsButton } from "./exportar-xls-button";
import { CancelarInscripcionButton } from "./cancelar-button";
import { DarPlazaButton } from "./dar-plaza-button";

export const metadata: Metadata = { title: "Inscritos · Admin" };

const etiquetaEstado: Record<string, string> = {
  pendiente_pago: "Pendiente de pago",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
};

const claseEstado: Record<string, string> = {
  pendiente_pago: "bg-ajag-oro-500/20 text-ajag-oro-600",
  confirmada: "bg-ajag-verde-50 text-ajag-verde-700",
  cancelada: "bg-ajag-gris-100 text-ajag-gris-500",
};

export default async function AdminInscritosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: torneo }, inscritos, listaEspera] = await Promise.all([
    supabase
      .from("torneos")
      .select("id, nombre, slug, cupo_maximo, lista_espera_automatica")
      .eq("id", id)
      .maybeSingle(),
    listarInscritosDetallados(id),
    listarListaEspera(supabase, id),
  ]);
  if (!torneo) notFound();

  const confirmados = inscritos.filter((i) => i.estado === "confirmada").length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/torneos" className="text-sm text-ajag-gris-500 hover:underline">
            ← Torneos
          </Link>
          <h1 className="font-display text-2xl font-semibold text-ajag-verde-900">Inscritos</h1>
          <p className="mt-0.5 text-sm text-ajag-gris-500">
            {confirmados} confirmados · {inscritos.length} en total
          </p>
        </div>
        <ExportarXlsButton torneoSlug={torneo.slug} inscritos={inscritos} />
      </div>

      {inscritos.length === 0 ? (
        <div className="card-ajag p-8 text-center text-ajag-gris-500">
          Todavía no hay ningún jugador inscrito en este torneo.
        </div>
      ) : (
        <div className="card-ajag overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-ajag-gris-100 text-xs uppercase tracking-wide text-ajag-gris-500">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Licencia</th>
                <th className="px-4 py-3 font-medium">Hándicap</th>
                <th className="px-4 py-3 font-medium">Socio</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {inscritos.map((i) => (
                <tr key={i.inscripcionId} className="border-b border-ajag-gris-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-ajag-verde-900">{i.nombreCompleto}</td>
                  <td className="px-4 py-3 text-ajag-gris-500">{i.licenciaFederativa ?? "—"}</td>
                  <td className="px-4 py-3 text-ajag-gris-500">{i.handicap ?? "—"}</td>
                  <td className="px-4 py-3 text-ajag-gris-500">{i.esSocio ? "Sí" : "No"}</td>
                  <td className="px-4 py-3 text-ajag-gris-500">{formatearPrecio(i.precioCents)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${claseEstado[i.estado] ?? "bg-ajag-gris-100 text-ajag-gris-500"}`}
                    >
                      {etiquetaEstado[i.estado] ?? i.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ajag-gris-500">{i.email ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    {i.estado !== "cancelada" ? (
                      <CancelarInscripcionButton inscripcionId={i.inscripcionId} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-ajag-verde-900">
            Lista de espera
          </h2>
          <span className="rounded-full bg-ajag-gris-100 px-2.5 py-1 text-xs font-medium text-ajag-gris-500">
            {torneo.lista_espera_automatica
              ? "Se cubre sola por orden de llegada"
              : "Cubre las plazas a mano con \"Dar plaza\""}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-ajag-gris-500">
          {torneo.cupo_maximo == null
            ? "Este torneo no tiene cupo máximo, así que nadie debería quedar en lista de espera."
            : "Jugadores que se apuntaron con el cupo lleno, en orden de llegada."}
        </p>

        {listaEspera.length === 0 ? (
          <div className="card-ajag mt-3 p-6 text-center text-sm text-ajag-gris-500">
            Nadie en lista de espera ahora mismo.
          </div>
        ) : (
          <div className="card-ajag mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-ajag-gris-100 text-xs uppercase tracking-wide text-ajag-gris-500">
                  <th className="px-4 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Licencia</th>
                  <th className="px-4 py-3 font-medium">Hándicap</th>
                  <th className="px-4 py-3 font-medium">Desde</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {listaEspera.map((e, indice) => (
                  <tr key={e.inscripcionId} className="border-b border-ajag-gris-100 last:border-0">
                    <td className="px-4 py-3 text-ajag-gris-500">{indice + 1}</td>
                    <td className="px-4 py-3 font-medium text-ajag-verde-900">{e.nombreCompleto}</td>
                    <td className="px-4 py-3 text-ajag-gris-500">{e.licenciaFederativa ?? "—"}</td>
                    <td className="px-4 py-3 text-ajag-gris-500">{e.handicap ?? "—"}</td>
                    <td className="px-4 py-3 text-ajag-gris-500">
                      {formatearFechaCorta(e.createdAt.slice(0, 10))}
                    </td>
                    <td className="px-4 py-3 text-ajag-gris-500">{e.email ?? "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <DarPlazaButton inscripcionId={e.inscripcionId} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
