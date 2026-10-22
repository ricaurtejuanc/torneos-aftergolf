import { ImageResponse } from "next/og";
import { obtenerOrganizadorActual } from "@/lib/data/organizador";
import { esDominioPlataforma, urlBaseActual } from "@/lib/sitio";

/**
 * Imagen de previsualización (og:image) por defecto de cada sitio: la que
 * sale al compartir cualquier página por WhatsApp/redes, salvo las fichas de
 * torneo con cartel, que usan su cartel. Es una ruta y no el fichero
 * `opengraph-image` porque ese tiene prioridad sobre generateMetadata y
 * taparía el cartel de cada torneo (mismo problema que tuvo el favicon).
 */
export async function GET() {
  const plataforma = await esDominioPlataforma();
  const organizador = plataforma ? null : await obtenerOrganizadorActual();
  const nombre = organizador?.nombre ?? (plataforma ? "AfterGolf Torneos" : "AJAG Golf");
  const subtitulo = plataforma
    ? "Torneos de golf amateur: inscripciones, salidas y clasificaciones"
    : "Torneos, inscripciones, horarios y clasificaciones";
  const fondo = organizador?.color_primario ?? (plataforma ? "#164026" : "#163821");

  const logoUrl =
    organizador?.logo_url ??
    `${await urlBaseActual()}${plataforma ? "/icon-aftergolf.png" : "/icon-ajag.png"}`;
  const logo = await logoComoDataUrl(logoUrl);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: fondo,
          backgroundImage: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(0,0,0,0.35))",
          color: "white",
          padding: "60px",
          textAlign: "center",
        }}
      >
        {logo ? (
          <div
            style={{
              display: "flex",
              width: 200,
              height: 200,
              borderRadius: 100,
              background: "white",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 40,
            }}
          >
            {/* 136px y redondeado: un logo JPEG cuadrado con fondo cabe entero en el círculo. */}
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse no admite next/image */}
            <img src={logo} width={136} height={136} style={{ objectFit: "contain", borderRadius: 68 }} alt="" />
          </div>
        ) : null}
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{nombre}</div>
        <div style={{ fontSize: 34, marginTop: 20, opacity: 0.85 }}>{subtitulo}</div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" },
    },
  );
}

// Satori no pinta SVG ni WebP de forma fiable y una imagen remota que falle
// rompería la respuesta entera: se descarga antes y, si no es PNG/JPEG, se
// genera la imagen sin logo.
async function logoComoDataUrl(url: string): Promise<string | null> {
  try {
    const respuesta = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (!respuesta.ok) return null;
    const tipo = respuesta.headers.get("content-type") ?? "";
    if (!/^image\/(png|jpe?g)/.test(tipo)) return null;
    const bytes = Buffer.from(await respuesta.arrayBuffer());
    return `data:${tipo};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}
