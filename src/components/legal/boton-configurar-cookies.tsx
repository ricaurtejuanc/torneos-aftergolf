"use client";

import { reabrirBannerCookies } from "@/lib/consentimiento-cookies";

/** Vuelve a mostrar el banner de cookies para cambiar la elección. */
export function BotonConfigurarCookies({ className }: { className?: string }) {
  return (
    <button type="button" onClick={reabrirBannerCookies} className={className}>
      Configurar cookies
    </button>
  );
}
