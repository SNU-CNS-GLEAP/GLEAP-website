ALTER TABLE "member_access" ADD COLUMN IF NOT EXISTS "cohort" text;
--> statement-breakpoint
UPDATE "member_access" AS access
SET "cohort" = profile."cohort", "updated_at" = now()
FROM "user" AS auth_user
INNER JOIN "member_profiles" AS profile ON profile."user_id" = auth_user."id"
WHERE lower(access."email") = lower(auth_user."email")
  AND access."cohort" IS NULL
  AND profile."cohort" IS NOT NULL;
