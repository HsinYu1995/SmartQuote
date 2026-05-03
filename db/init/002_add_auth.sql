alter table brokers add column if not exists password_hash text;

-- Give the seeded demo broker a default password: demo1234
update brokers
set password_hash = crypt('demo1234', gen_salt('bf'))
where email = 'alex.johnson@smartquote.com'
  and password_hash is null;
