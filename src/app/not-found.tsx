import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada" };

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <p className="font-display text-6xl font-semibold text-ajag-verde-700">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold text-ajag-verde-900">
        Esta bola se ha ido fuera de límites
      </h1>
      <p className="mt-3 text-sm text-ajag-gris-500">
        La página que buscas no existe o ha cambiado de sitio. Vuelve al inicio o
        consulta el calendario de torneos.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-ajag-verde-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-ajag-verde-600"
        >
          Volver al inicio
        </Link>
        <Link
          href="/torneos"
          className="rounded-xl border border-ajag-gris-200 px-6 py-2.5 text-sm font-medium text-ajag-verde-900 transition hover:border-ajag-verde-600"
        >
          Ver torneos
        </Link>
      </div>
    </div>
  );
}
