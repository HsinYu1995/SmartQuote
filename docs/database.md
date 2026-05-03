# Database Design

SmartQuote should use PostgreSQL as its production database. The domain is structured, relational, and read-heavy: brokers need to review dashboards, search history, filter quotes, and inspect quote details more often than they create new quotes.

## Recommended Approach

Start with PostgreSQL and optimize for reliable reads, filtering, and auditability.

For an early MVP, keep insurance-specific quote conditions in a `jsonb` column on `quotes`. This avoids schema churn while the car, house, and health quote forms are still changing.

When the product stabilizes, split conditions into separate tables:

- `car_quote_conditions`
- `house_quote_conditions`
- `health_quote_conditions`

## Local Development

The repo includes a Docker Compose service for PostgreSQL.

```bash
cp .env.example .env
npm run db:start
```

Default connection string:

```text
postgresql://smartquote:smartquote_dev_password@localhost:5432/smartquote
```

The schema in `db/init/001_schema.sql` is applied automatically the first time the Postgres volume is created.

To stop the database:

```bash
npm run db:stop
```

To remove the local database data and re-run initialization:

```bash
npm run db:reset
```

## Core Tables

```sql
create table brokers (
  id uuid primary key,
  name text not null,
  email text not null unique,
  license_number text not null,
  agency text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id uuid primary key,
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

create table quotes (
  id uuid primary key,
  reference_number text not null unique,
  broker_id uuid not null references brokers(id),
  client_id uuid not null references clients(id),
  type text not null check (type in ('car', 'house', 'health')),
  status text not null check (status in ('pending', 'approved', 'rejected', 'expired')),
  condition jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table quote_results (
  id uuid primary key,
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
```

## Suggested Indexes

```sql
create index quotes_broker_id_idx on quotes(broker_id);
create index quotes_status_idx on quotes(status);
create index quotes_type_idx on quotes(type);
create index quotes_created_at_idx on quotes(created_at desc);
create index quotes_broker_created_at_idx on quotes(broker_id, created_at desc);
create index clients_email_idx on clients(email);
create index clients_name_idx on clients(last_name, first_name);
```

If search becomes important, add full-text search or trigram indexes for client names, email, and reference numbers.

## Read vs Write Priority

SmartQuote should prioritize read performance first:

- dashboard statistics
- recent quote lists
- quote history filtering
- quote detail pages
- broker reporting

Writes are still important, but quote creation is less frequent than quote lookup and review. PostgreSQL can handle both well, and the right indexes will support the app's main workflows.
