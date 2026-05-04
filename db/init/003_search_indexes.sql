create extension if not exists pg_trgm;

-- GIN trigram indexes let ilike '%term%' use the index instead of seqscanning
create index if not exists clients_name_trgm_idx
  on clients using gin ((first_name || ' ' || last_name) gin_trgm_ops);

create index if not exists clients_email_trgm_idx
  on clients using gin (email gin_trgm_ops);

create index if not exists quotes_reference_trgm_idx
  on quotes using gin (reference_number gin_trgm_ops);

-- Missing FK index — Postgres doesn't create these automatically
create index if not exists quotes_client_id_idx on quotes(client_id);
