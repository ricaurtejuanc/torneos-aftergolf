import type { Metadata } from "next";
import { PaginaLegal } from "@/components/legal/pagina-legal";
import { BotonConfigurarCookies } from "@/components/legal/boton-configurar-cookies";

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies usa este sitio web y cómo gestionarlas.",
};

export default function CookiesPage() {
  return (
    <PaginaLegal titulo="Política de cookies">
      <p>
        Una cookie es un pequeño archivo que un sitio web guarda en tu navegador. Este sitio usa el
        mínimo imprescindible, conforme al artículo 22.2 de la LSSI-CE y a la guía de la Agencia
        Española de Protección de Datos.
      </p>

      <h2>Cookies técnicas (siempre activas)</h2>
      <p>Son necesarias para que la web funcione y no requieren tu consentimiento:</p>
      <ul>
        <li>
          <strong>sb-*</strong> (Supabase): mantienen tu sesión iniciada. Duran lo que dure tu
          sesión.
        </li>
        <li>
          <strong>Preferencia de cookies</strong> (almacenamiento local del navegador): recuerda si
          has aceptado o rechazado la analítica, para no volver a preguntarte. Dura 12 meses.
        </li>
      </ul>

      <h2>Analítica (solo si la aceptas)</h2>
      <p>
        Nos ayudan a saber qué páginas se visitan y cómo de rápido cargan, para mejorar el sitio.
        No se usan para publicidad ni para identificarte:
      </p>
      <ul>
        <li>
          <strong>Contador de visitas propio</strong>: registra la página visitada, la página de
          procedencia, el navegador y una huella irreversible (hash) de tu IP.
        </li>
        <li>
          <strong>Vercel Analytics y Speed Insights</strong>: estadísticas agregadas de visitas y de
          velocidad de carga, sin cookies de seguimiento entre sitios.
        </li>
      </ul>

      <h2>Cómo cambiar tu elección</h2>
      <p>
        Puedes cambiar de opinión en cualquier momento desde aquí. También puedes borrar o bloquear
        las cookies desde la configuración de tu navegador.
      </p>
      <BotonConfigurarCookies className="rounded-xl bg-ajag-verde-700 px-5 py-2.5 text-sm font-medium text-white no-underline transition hover:bg-ajag-verde-600" />
    </PaginaLegal>
  );
}
