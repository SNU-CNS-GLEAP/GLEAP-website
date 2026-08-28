ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "section" text DEFAULT 'notice' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "posts" ADD CONSTRAINT "posts_section_check" CHECK ("posts"."section" in ('notice', 'academic', 'activity'));
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
