create extension if not exists pgcrypto;

create table if not exists brokers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  license_number text not null,
  agency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date not null,
  email text not null,
  phone text not null,
  address text not null,
  city text not null,
  state text not null,
  zip_code text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  reference_number text not null unique,
  broker_id uuid not null references brokers(id),
  client_id uuid not null references clients(id),
  type text not null check (type in ('car', 'house', 'health')),
  status text not null check (status in ('pending', 'approved', 'rejected', 'expired')),
  condition jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists quote_results (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null unique references quotes(id) on delete cascade,
  monthly_premium numeric(12, 2) not null,
  annual_premium numeric(12, 2) not null,
  deductible numeric(12, 2) not null,
  coverage_limit numeric(14, 2) not null,
  effective_date date not null,
  expiry_date date not null,
  breakdown jsonb not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists quotes_broker_id_idx on quotes(broker_id);
create index if not exists quotes_status_idx on quotes(status);
create index if not exists quotes_type_idx on quotes(type);
create index if not exists quotes_created_at_idx on quotes(created_at desc);
create index if not exists quotes_broker_created_at_idx on quotes(broker_id, created_at desc);
create index if not exists clients_email_idx on clients(email);
create index if not exists clients_name_idx on clients(last_name, first_name);

insert into brokers (name, email, license_number, agency)
values ('Alex Johnson', 'alex.johnson@smartquote.com', 'LIC-2024-00123', 'SmartQuote Insurance Group')
on conflict (email) do nothing;
