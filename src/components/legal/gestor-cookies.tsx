"use client";

import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { VisitTracker } from "@/components/analytics/visit-tracker";
import { guardarConsentimiento, useConsentimientoCookies } from "@/lib/consentimiento-cookies";

/**
 * Banner de consentimiento + carga condicional de la analítica: el contador
 * de visitas propio y Vercel Analytics/Speed Insights solo se montan si el
 * visitante ha aceptado. Las cookies de sesión de Supabase son técnicas y
 * no dependen de esto.
 */
export function GestorCookies() {
  const { consentimiento, mostrarBanner } = useConsentimientoCookies();

  return (
    <>
      {consentimiento === "aceptadas" ? (
        <>
          <VisitTracker />
          <Analytics />
          <SpeedInsights />
        </>
      ) : null}

      {mostrarBanner ? (
        <div
          role="dialog"
          aria-live="polite"
          aria-label="Consentimiento de cookies"
          className="fixed inset-x-0 bottom-0 z-50 p-3 print:hidden sm:p-4"
        >
          <div className="mx-auto flex max-w-4xl flex-col gap-3 rounded-2xl border border-ajag-gris-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:gap-6">
            <p className="flex-1 text-sm text-foreground">
              Usamos cookies técnicas para que la web funcione y, si nos das permiso, analítica
              para saber qué páginas se visitan y mejorar el sitio. Más información en la{" "}
              <Link href="/cookies" className="font-medium text-ajag-verde-700 underline">
                política de cookies
              </Link>
              .
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => guardarConsentimiento("rechazadas")}
                className="flex-1 rounded-xl border border-ajag-verde-700 px-4 py-2 text-sm font-medium text-ajag-verde-700 transition hover:bg-ajag-verde-50 sm:flex-none"
              >
                Rechazar
              </button>
              <button
                type="button"
                onClick={() => guardarConsentimiento("aceptadas")}
                className="flex-1 rounded-xl bg-ajag-verde-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-ajag-verde-600 sm:flex-none"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
