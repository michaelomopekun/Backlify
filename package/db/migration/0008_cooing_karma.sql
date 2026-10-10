ALTER TABLE "projects" ADD COLUMN "use_custom_vault" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vault_endpoint" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vault_access_key_id" text;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "vault_secret_key" text;