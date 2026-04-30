CREATE TABLE IF NOT EXISTS languages (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY,
  brand_name TEXT NOT NULL,
  hero_title TEXT NOT NULL,
  hero_subtitle TEXT NOT NULL,
  hero_image_url TEXT NOT NULL,
  primary_cta_label TEXT NOT NULL,
  secondary_cta_label TEXT NOT NULL,
  features_title TEXT NOT NULL,
  products_title TEXT NOT NULL,
  products_subtitle TEXT NOT NULL,
  testimonials_title TEXT NOT NULL,
  cta_title TEXT NOT NULL,
  cta_subtitle TEXT NOT NULL,
  cta_button_label TEXT NOT NULL,
  contact_title TEXT NOT NULL,
  phone TEXT NOT NULL,
  line_id TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT NOT NULL,
  footer_description TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_stats (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS features (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  size_label TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT NOT NULL,
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  customer_name TEXT NOT NULL,
  location TEXT NOT NULL,
  comment TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS social_links (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  google_email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add language_code to content tables (idempotent ALTER statements)
ALTER TABLE site_content ADD COLUMN IF NOT EXISTS language_code TEXT NOT NULL DEFAULT 'th';
CREATE UNIQUE INDEX IF NOT EXISTS site_content_language_code_key ON site_content (language_code);

-- Allow site_content id to auto-generate for new language rows
CREATE SEQUENCE IF NOT EXISTS site_content_id_seq START 2;
ALTER TABLE site_content ALTER COLUMN id SET DEFAULT nextval('site_content_id_seq');

ALTER TABLE site_stats ADD COLUMN IF NOT EXISTS language_code TEXT NOT NULL DEFAULT 'th';
ALTER TABLE features ADD COLUMN IF NOT EXISTS language_code TEXT NOT NULL DEFAULT 'th';
ALTER TABLE products ADD COLUMN IF NOT EXISTS language_code TEXT NOT NULL DEFAULT 'th';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS language_code TEXT NOT NULL DEFAULT 'th';
ALTER TABLE social_links ADD COLUMN IF NOT EXISTS language_code TEXT NOT NULL DEFAULT 'th';
