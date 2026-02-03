-- Phase 2: Add translation columns to all content tables

-- Add translation columns to blog_posts
ALTER TABLE blog_posts 
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS title_ru TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_fr TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_es TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_de TEXT,
  ADD COLUMN IF NOT EXISTS excerpt_ru TEXT,
  ADD COLUMN IF NOT EXISTS content_fr TEXT,
  ADD COLUMN IF NOT EXISTS content_es TEXT,
  ADD COLUMN IF NOT EXISTS content_de TEXT,
  ADD COLUMN IF NOT EXISTS content_ru TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_fr TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_es TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_de TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_ru TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_fr TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_es TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_de TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_ru TEXT,
  ADD COLUMN IF NOT EXISTS translation_status JSONB DEFAULT '{"fr": "missing", "es": "missing", "de": "missing", "ru": "missing"}'::jsonb;

-- Add translation columns to courses
ALTER TABLE courses 
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS title_ru TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS description_ru TEXT,
  ADD COLUMN IF NOT EXISTS translation_status JSONB DEFAULT '{"fr": "missing", "es": "missing", "de": "missing", "ru": "missing"}'::jsonb;

-- Add translation columns to ebooks
ALTER TABLE ebooks 
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS title_ru TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS description_ru TEXT,
  ADD COLUMN IF NOT EXISTS translation_status JSONB DEFAULT '{"fr": "missing", "es": "missing", "de": "missing", "ru": "missing"}'::jsonb;

-- Add translation columns to materials
ALTER TABLE materials 
  ADD COLUMN IF NOT EXISTS title_fr TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS title_de TEXT,
  ADD COLUMN IF NOT EXISTS title_ru TEXT,
  ADD COLUMN IF NOT EXISTS description_fr TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT,
  ADD COLUMN IF NOT EXISTS description_de TEXT,
  ADD COLUMN IF NOT EXISTS description_ru TEXT,
  ADD COLUMN IF NOT EXISTS translation_status JSONB DEFAULT '{"fr": "missing", "es": "missing", "de": "missing", "ru": "missing"}'::jsonb;

-- Add translation columns to faqs
ALTER TABLE faqs 
  ADD COLUMN IF NOT EXISTS question_fr TEXT,
  ADD COLUMN IF NOT EXISTS question_es TEXT,
  ADD COLUMN IF NOT EXISTS question_de TEXT,
  ADD COLUMN IF NOT EXISTS question_ru TEXT,
  ADD COLUMN IF NOT EXISTS answer_fr TEXT,
  ADD COLUMN IF NOT EXISTS answer_es TEXT,
  ADD COLUMN IF NOT EXISTS answer_de TEXT,
  ADD COLUMN IF NOT EXISTS answer_ru TEXT,
  ADD COLUMN IF NOT EXISTS translation_status JSONB DEFAULT '{"fr": "missing", "es": "missing", "de": "missing", "ru": "missing"}'::jsonb;