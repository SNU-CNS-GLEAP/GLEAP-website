CREATE TABLE IF NOT EXISTS "member_post_dislikes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_post_dislikes" ADD CONSTRAINT "member_post_dislikes_post_id_member_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."member_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "member_post_dislikes" ADD CONSTRAINT "member_post_dislikes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "member_post_dislikes_post_user_unique" ON "member_post_dislikes" USING btree ("post_id","user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "member_post_dislikes_post_id_idx" ON "member_post_dislikes" USING btree ("post_id");
