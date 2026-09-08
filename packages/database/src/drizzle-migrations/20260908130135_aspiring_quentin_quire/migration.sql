CREATE TYPE "action_type" AS ENUM('warn', 'timeout', 'kick', 'softban', 'tempban', 'ban', 'unwarn', 'untimeout', 'unban');--> statement-breakpoint
CREATE TABLE "discord_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"discord_id" text NOT NULL UNIQUE,
	"merit" integer DEFAULT 100 NOT NULL,
	"note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"case_id" text NOT NULL,
	"discord_id" uuid NOT NULL,
	"type" "action_type" NOT NULL,
	"reason" text,
	"auto" boolean DEFAULT false,
	"merit_penalty" integer,
	"after_merit" integer,
	"message_id" text,
	"message_content" text,
	"evidence_image" text,
	"linked_action_id" uuid,
	"created_by" uuid NOT NULL,
	"dismissed_by" uuid NOT NULL,
	"expires_at" timestamp,
	"dismissed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "actions_caseId_uidx" ON "actions" ("case_id");--> statement-breakpoint
CREATE INDEX "actions_discordId_createdAt_idx" ON "actions" ("discord_id","created_at" DESC NULLS LAST);--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_discord_id_discord_users_id_fkey" FOREIGN KEY ("discord_id") REFERENCES "discord_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;