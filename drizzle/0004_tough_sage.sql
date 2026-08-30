DROP INDEX IF EXISTS "account_provider_account_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "account_issuer_account_unique" ON "account" USING btree ("issuer","account_id");
