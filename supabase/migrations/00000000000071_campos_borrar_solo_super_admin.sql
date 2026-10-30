-- El catálogo de campos (campos_golf / campo_tees / campo_hoyos) es común a
-- todos los organizadores: borrar un recorrido o una barra lo quita para
-- todos los clubes. Antes podía hacerlo cualquier admin de cualquier club;
-- ahora solo el super-admin de la plataforma. Añadir y editar sigue abierto
-- a cualquier admin (corregir una valoración es habitual).
--
-- alter policy (y no drop + create) para no pasar por la confirmación
-- interactiva del MCP de Supabase con los DROP.
alter policy campos_golf_delete_admin on public.campos_golf using (is_super_admin());
alter policy campo_tees_delete_admin on public.campo_tees using (is_super_admin());
alter policy campo_hoyos_delete_admin on public.campo_hoyos using (is_super_admin());
