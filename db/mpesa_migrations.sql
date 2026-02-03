-- Create mpesa_transactions table
CREATE TABLE IF NOT EXISTS mpesa_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text,
  amount numeric,
  account_reference text,
  description text,
  request_payload jsonb,
  response_payload jsonb,
  callback_payload jsonb,
  status text,
  created_at timestamptz DEFAULT now()
);

-- Ensure single-row site_settings exists; add MPESA fields
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS mpesa_consumer_key text;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS mpesa_consumer_secret text;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS mpesa_short_code text;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS mpesa_passkey text;
ALTER TABLE IF EXISTS site_settings ADD COLUMN IF NOT EXISTS mpesa_callback_url text;

-- Example insert (optional):
-- INSERT INTO site_settings (id, mpesa_consumer_key, mpesa_consumer_secret, mpesa_short_code, mpesa_passkey, mpesa_callback_url, created_at) \
-- VALUES ('00000000-0000-0000-0000-000000000000', 'your_consumer_key', 'your_consumer_secret', '123456', 'your_passkey', 'https://your-domain.com/.netlify/functions/mpesa_callback', now())
