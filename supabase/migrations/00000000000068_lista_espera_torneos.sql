-- Lista de espera: un jugador puede apuntarse aunque el cupo esté lleno,
-- queda en inscripciones.estado = 'en_lista_espera' (torneos_cupo ya la
-- excluye del recuento al no estar en su lista de estados). Cuando se
-- libera una plaza, se puede cubrir a mano desde el admin o, si el
-- torneo tiene lista_espera_automatica activado, se cubre sola con el
-- primero de la lista (orden de llegada = created_at).
alter type estado_inscripcion add value 'en_lista_espera';
alter table torneos add column lista_espera_automatica boolean not null default false;
