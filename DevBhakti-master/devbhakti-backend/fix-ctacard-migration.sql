-- Fix CTACard missing multilingual columns
ALTER TABLE "CTACard"
  ADD COLUMN IF NOT EXISTS "title_en" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "title_hi" TEXT,
  ADD COLUMN IF NOT EXISTS "title_mr" TEXT,
  ADD COLUMN IF NOT EXISTS "points_en" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "points_hi" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "points_mr" TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "buttonText_en" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "buttonText_hi" TEXT,
  ADD COLUMN IF NOT EXISTS "buttonText_mr" TEXT;

-- Fix Event missing multilingual columns
ALTER TABLE "Event"
  ADD COLUMN IF NOT EXISTS "name_en" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "name_hi" TEXT,
  ADD COLUMN IF NOT EXISTS "name_mr" TEXT,
  ADD COLUMN IF NOT EXISTS "description_en" TEXT,
  ADD COLUMN IF NOT EXISTS "description_hi" TEXT,
  ADD COLUMN IF NOT EXISTS "description_mr" TEXT;

-- Migrate existing 'icon' column data to name_en if CTACard had a name field
-- (Set title_en to cardType as placeholder if empty)
UPDATE "CTACard" SET "title_en" = "cardType" WHERE "title_en" = '';
UPDATE "CTACard" SET "buttonText_en" = 'Learn More' WHERE "buttonText_en" = '';
UPDATE "Event" SET "name_en" = COALESCE("name_en", 'Event') WHERE "name_en" = '';
