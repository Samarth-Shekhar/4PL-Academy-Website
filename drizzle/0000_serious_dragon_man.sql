CREATE TABLE "academy_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"university_id" integer,
	"location" text DEFAULT '' NOT NULL,
	"degree" text DEFAULT '' NOT NULL,
	"category" text DEFAULT '' NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academy_content_kind_check" CHECK ("academy_content"."kind" in ('universities','programs','courses','blogs','faqs','pages','media','seo','settings')),
	CONSTRAINT "academy_content_status_check" CHECK ("academy_content"."status" in ('published','draft','archived'))
);
--> statement-breakpoint
CREATE TABLE "academy_admins" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text DEFAULT 'admin' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academy_admins_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "academy_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "academy_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"consent" boolean NOT NULL,
	"category" text DEFAULT 'contact' NOT NULL,
	"university" text DEFAULT '' NOT NULL,
	"program" text DEFAULT '' NOT NULL,
	"course" text DEFAULT '' NOT NULL,
	"content_id" integer,
	"source" text DEFAULT 'website' NOT NULL,
	"utm" text DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'New' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "academy_leads_status_check" CHECK ("academy_leads"."status" in ('New','Contacted','Interested','Application Started','Applied','Admission Confirmed','Closed'))
);
--> statement-breakpoint
ALTER TABLE "academy_content" ADD CONSTRAINT "academy_content_university_id_academy_content_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."academy_content"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_sessions" ADD CONSTRAINT "academy_sessions_admin_id_academy_admins_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."academy_admins"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "academy_leads" ADD CONSTRAINT "academy_leads_content_id_academy_content_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."academy_content"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "academy_content_kind_slug_idx" ON "academy_content" USING btree ("kind","slug");--> statement-breakpoint
CREATE INDEX "academy_content_status_featured_idx" ON "academy_content" USING btree ("kind","status","featured");--> statement-breakpoint
CREATE INDEX "academy_content_university_idx" ON "academy_content" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "academy_content_location_degree_idx" ON "academy_content" USING btree ("location","degree");--> statement-breakpoint
CREATE INDEX "academy_sessions_expiry_idx" ON "academy_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "academy_leads_status_idx" ON "academy_leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "academy_leads_category_date_idx" ON "academy_leads" USING btree ("category","created_at");