CREATE TABLE "posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"title_ko" text NOT NULL,
	"title_en" text,
	"body_ko" text NOT NULL,
	"body_en" text,
	"author_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
