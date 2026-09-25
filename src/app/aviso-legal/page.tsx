import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal, DatosTitular } from "@/components/legal/pagina-legal";
import { obtenerTitularLegal } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Aviso legal",
  description: "Datos identificativos del titular del sitio web y condiciones de uso.",
};

export default async function AvisoLegalPage() {
  const titular = await obtenerTitularLegal();

  return (
    <PaginaLegal titulo="Aviso legal">
      <p>
        En cumplimiento del artículo 10 de la Ley 34/2002, de Servicios de la Sociedad de la
        Información y de Comercio Electrónico (LSSI-CE), se informa de los datos identificativos del
        titular de este sitio web:
      </p>
      <DatosTitular titular={titular} />

      {titular.esOrganizador ? (
        <p>
          Este sitio funciona sobre la plataforma <strong>AfterGolf Torneos</strong>, que presta a{" "}
          {titular.nombre} el servicio tecnológico de gestión de torneos, inscripciones y
          clasificaciones. La organización de los torneos y el contenido publicado son
          responsabilidad de {titular.nombre}.
        </p>
      ) : null}

      <h2>Objeto</h2>
      <p>
        Este sitio web ofrece información sobre torneos de golf amateur, permite inscribirse en
        ellos, consultar horarios de salida, resultados y clasificaciones, y contactar con el
        organizador. El acceso y uso del sitio atribuye la condición de usuario e implica la
        aceptación de este aviso legal y de los{" "}
        <Link href="/terminos">Términos y condiciones</Link>.
      </p>

      <h2>Propiedad intelectual e industrial</h2>
      <p>
        Los textos, logotipos, imágenes, diseño y código fuente de este sitio son propiedad de su
        titular, de AfterGolf Torneos o de terceros que han autorizado su uso (por ejemplo,
        patrocinadores). Queda prohibida su reproducción, distribución o transformación con fines
        comerciales sin autorización previa.
      </p>

      <h2>Responsabilidad</h2>
      <p>
        El titular procura que la información publicada (fechas, horarios, resultados,
        clasificaciones) sea correcta y esté actualizada, pero no garantiza la ausencia de errores ni
        la disponibilidad ininterrumpida del sitio. Los enlaces a sitios de terceros se ofrecen solo
        a título informativo; el titular no se responsabiliza de su contenido.
      </p>

      <h2>Protección de datos y cookies</h2>
      <p>
        El tratamiento de datos personales se rige por la{" "}
        <Link href="/privacidad">Política de privacidad</Link> y el uso de cookies por la{" "}
        <Link href="/cookies">Política de cookies</Link>.
      </p>

      <h2>Legislación aplicable</h2>
      <p>
        Este aviso legal se rige por la legislación española. Para cualquier controversia, las
        partes se someten a los juzgados y tribunales que correspondan conforme a la normativa
        aplicable, en particular la de protección de consumidores y usuarios.
      </p>
    </PaginaLegal>
  );
}
