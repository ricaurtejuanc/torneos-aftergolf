-- Grants explícitos de la Data API (PostgREST / supabase-js / GraphQL).
--
-- A partir del 30 de octubre de 2026 Supabase deja de dar acceso automático
-- a la Data API a las tablas NUEVAS del schema public: sin un GRANT
-- explícito, la API devuelve "permission denied". Las tablas que ya
-- existen conservan sus grants.
--
-- En este proyecto esto es un NO-OP: todas las tablas, vistas y la
-- secuencia de abajo ya tienen todos los privilegios para anon,
-- authenticated y service_role (concedidos por postgres, el mismo rol que
-- aplica esta migración, así que no se añade ninguna entrada nueva al ACL).
-- Se deja escrito para que recrear el schema desde las migraciones (un
-- `supabase db reset`, una preview branch o un proyecto nuevo) no se quede
-- sin acceso a la Data API tras esa fecha.
--
-- Qué puede hacer cada rol lo sigue decidiendo RLS, no estos grants.
--
-- Regla a partir de ahora: cada migración que cree una tabla en public
-- debe incluir su propio
--   grant all on table public.<tabla> to anon, authenticated, service_role;

-- Tablas
grant all on table public.campo_hoyos to anon, authenticated, service_role;
grant all on table public.campo_tees to anon, authenticated, service_role;
grant all on table public.campos_golf to anon, authenticated, service_role;
grant all on table public.clasificacion_global to anon, authenticated, service_role;
grant all on table public.configuracion to anon, authenticated, service_role;
grant all on table public.consultas_contacto to anon, authenticated, service_role;
grant all on table public.grupo_salida_jugadores to anon, authenticated, service_role;
grant all on table public.grupos_salida to anon, authenticated, service_role;
grant all on table public.inscripciones to anon, authenticated, service_role;
grant all on table public.jugadores to anon, authenticated, service_role;
grant all on table public.ligas_pool to anon, authenticated, service_role;
grant all on table public.movimientos_economicos to anon, authenticated, service_role;
grant all on table public.organizadores to anon, authenticated, service_role;
grant all on table public.patrocinadores to anon, authenticated, service_role;
grant all on table public.pedidos_pago to anon, authenticated, service_role;
grant all on table public.resultados to anon, authenticated, service_role;
grant all on table public.resultados_pdf_uploads to anon, authenticated, service_role;
grant all on table public.rondas to anon, authenticated, service_role;
grant all on table public.salidas to anon, authenticated, service_role;
grant all on table public.super_admins to anon, authenticated, service_role;
grant all on table public.torneos to anon, authenticated, service_role;
grant all on table public.usuarios_admin to anon, authenticated, service_role;
grant all on table public.visitas_web to anon, authenticated, service_role;

-- Vistas
grant all on table public.clasificacion_publica to anon, authenticated, service_role;
grant all on table public.salidas_publicadas to anon, authenticated, service_role;
grant all on table public.torneos_cupo to anon, authenticated, service_role;

-- Secuencias (visitas_web.id es bigserial: insertar una visita la usa)
grant all on sequence public.visitas_web_id_seq to anon, authenticated, service_role;
