import Link from "next/link";
import { TEXTOS_LEGALES_ACTUALIZADOS } from "@/lib/legal";

const ENLACES = [
  { href: "/aviso-legal", label: "Aviso legal" },
  { href: "/privacidad", label: "Privacidad" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terminos", label: "Términos y condiciones" },
];

/** Maqueta común de las páginas legales (texto largo con títulos de sección). */
export function PaginaLegal({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <nav className="mb-6 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ajag-gris-500">
        <Link href="/" className="hover:text-ajag-verde-700">
          ← Inicio
        </Link>
        {ENLACES.map((e) => (
          <Link key={e.href} href={e.href} className="hover:text-ajag-verde-700 hover:underline">
            {e.label}
          </Link>
        ))}
      </nav>
      <h1 className="font-display text-3xl font-semibold text-ajag-verde-900">{titulo}</h1>
      <p className="mt-2 text-xs text-ajag-gris-500">Última actualización: {TEXTOS_LEGALES_ACTUALIZADOS}</p>
      <div className="mt-8 space-y-4 text-sm leading-relaxed text-foreground [&_a]:text-ajag-verde-700 [&_a]:underline [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-ajag-verde-900 [&_li]:ml-5 [&_li]:list-disc [&_li]:pl-1 [&_ul]:space-y-1.5">
        {children}
      </div>
    </div>
  );
}

/** Bloque con los datos identificativos del titular (LSSI art. 10). */
export function DatosTitular({
  titular,
}: {
  titular: {
    nombre: string;
    razonSocial: string | null;
    nif: string | null;
    domicilio: string | null;
    email: string | null;
  };
}) {
  return (
    <ul>
      <li>
        <strong>Titular:</strong> {titular.razonSocial ?? titular.nombre}
      </li>
      {titular.nif ? (
        <li>
          <strong>NIF:</strong> {titular.nif}
        </li>
      ) : null}
      {titular.domicilio ? (
        <li>
          <strong>Domicilio:</strong> {titular.domicilio}
        </li>
      ) : null}
      {titular.email ? (
        <li>
          <strong>Email de contacto:</strong> <a href={`mailto:${titular.email}`}>{titular.email}</a>
        </li>
      ) : (
        <li>
          <strong>Contacto:</strong> a través del <Link href="/contacto">formulario de contacto</Link>
        </li>
      )}
    </ul>
  );
}
