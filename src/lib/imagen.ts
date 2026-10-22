/**
 * next/image no optimiza SVG (sin `dangerouslyAllowSVG`), así que un logo
 * SVG necesita `unoptimized`; cualquier otra imagen (PNG/JPG de Supabase
 * Storage) sí debe pasar por el optimizador para servirse redimensionada y
 * en WebP/AVIF en vez del original completo.
 */
export function esSvg(url: string | null | undefined): boolean {
  return Boolean(url && /\.svg(?:$|[?#])/i.test(url));
}
