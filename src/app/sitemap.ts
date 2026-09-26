import type { MetadataRoute } from "next";
import { urlBaseActual, esDominioPlataforma } from "@/lib/sitio";
import { listarTorneosPublicos } from "@/lib/data/torneos";
import { listarLigasActivas } from "@/lib/data/ligas";

const PAGINAS_LEGALES = ["/aviso-legal", "/privacidad", "/cookies", "/terminos"];

// Un sitemap por dominio: el de la plataforma solo lleva la landing, y el
// de cada organizador sus propias páginas, torneos y clasificaciones.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await urlBaseActual();

  if (await esDominioPlataforma()) {
    return [
      { url: base, changeFrequency: "monthly", priority: 1 },
      ...PAGINAS_LEGALES.map((ruta) => ({ url: `${base}${ruta}`, priority: 0.1 })),
    ];
  }

  const [torneos, ligas] = await Promise.all([listarTorneosPublicos(), listarLigasActivas()]);

  const estaticas: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/torneos`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/clasificaciones`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/horarios`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/handicap`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/patrocinadores`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contacto`, changeFrequency: "yearly", priority: 0.4 },
    ...PAGINAS_LEGALES.map((ruta) => ({ url: `${base}${ruta}`, priority: 0.1 })),
  ];

  return [
    ...estaticas,
    ...torneos.map((t) => ({
      url: `${base}/torneos/${t.slug}`,
      lastModified: t.updated_at ?? undefined,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...ligas.map((l) => ({
      url: `${base}/clasificaciones/${l.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
