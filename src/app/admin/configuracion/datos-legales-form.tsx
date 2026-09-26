"use client";

import { useActionState } from "react";
import { actualizarDatosLegales, type EstadoConfiguracion } from "./actions";
import type { DatosLegales } from "@/lib/data/configuracion";

const CAMPOS: { name: keyof DatosLegales; label: string; placeholder: string }[] = [
  { name: "razon_social", label: "Razón social / nombre de la entidad", placeholder: "Ej. Asociación de Jugadores Amateur de Golf" },
  { name: "nif", label: "NIF / CIF", placeholder: "Ej. G12345678" },
  { name: "domicilio", label: "Domicilio social", placeholder: "Calle, número, CP, ciudad" },
];

export function DatosLegalesForm({ datosActuales }: { datosActuales: DatosLegales | null }) {
  const [state, formAction, pending] = useActionState<EstadoConfiguracion, FormData>(
    actualizarDatosLegales,
    { ok: false, error: null },
  );

  return (
    <form action={formAction} className="card-ajag flex max-w-xl flex-col gap-3 p-5">
      <p className="text-sm font-medium text-ajag-verde-900">Datos legales</p>
      {CAMPOS.map((campo) => (
        <div key={campo.name}>
          <label htmlFor={campo.name} className="text-xs text-ajag-gris-500">
            {campo.label}
          </label>
          <input
            id={campo.name}
            name={campo.name}
            defaultValue={datosActuales?.[campo.name] ?? ""}
            placeholder={campo.placeholder}
            className="mt-1 w-full rounded-xl border border-ajag-gris-200 px-4 py-2.5 text-sm outline-none focus:border-ajag-verde-600"
          />
        </div>
      ))}
      <p className="text-xs text-ajag-gris-500">
        Se muestran en el Aviso legal y la Política de privacidad de tu web, como titular del
        sitio y responsable de los datos. La ley (LSSI) obliga a publicarlos.
      </p>
      {state.error ? <p className="text-sm text-ajag-rojo-600">{state.error}</p> : null}
      {state.ok ? <p className="text-sm text-ajag-verde-700">Actualizado.</p> : null}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded-xl bg-ajag-verde-700 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-ajag-verde-600 disabled:opacity-60"
      >
        {pending ? "Guardando..." : "Guardar"}
      </button>
    </form>
  );
}
