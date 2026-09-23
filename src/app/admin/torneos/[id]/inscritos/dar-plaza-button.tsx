"use client";

import { useTransition } from "react";
import { darPlazaListaEspera } from "./actions";

export function DarPlazaButton({ inscripcionId }: { inscripcionId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("¿Dar plaza a este jugador? Se le creará el pedido de pago (o se le confirmará directamente si el torneo se paga en el club) y se le avisará por email.")) {
          startTransition(() => darPlazaListaEspera(inscripcionId));
        }
      }}
      className="rounded-full bg-ajag-verde-700 px-3 py-1 text-xs font-medium text-white transition hover:bg-ajag-verde-600 disabled:opacity-50"
    >
      {pending ? "Dando plaza..." : "Dar plaza"}
    </button>
  );
}
