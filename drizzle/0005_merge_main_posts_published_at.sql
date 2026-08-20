ALTER TABLE "posts"
  ADD COLUMN IF NOT EXISTS "published_at" timestamp with time zone DEFAULT now() NOT NULL;
