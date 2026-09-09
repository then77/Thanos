CREATE TABLE "action_evidences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"action_id" uuid NOT NULL,
	"message_id" text,
	"message_content" text,
	"evidence_image" text,
	"created_by" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "actions" DROP COLUMN "message_id";--> statement-breakpoint
ALTER TABLE "actions" DROP COLUMN "message_content";--> statement-breakpoint
ALTER TABLE "actions" DROP COLUMN "evidence_image";--> statement-breakpoint
CREATE INDEX "action_evidences_actionId_idx" ON "action_evidences" ("action_id");--> statement-breakpoint
ALTER TABLE "action_evidences" ADD CONSTRAINT "action_evidences_action_id_actions_id_fkey" FOREIGN KEY ("action_id") REFERENCES "actions"("id") ON DELETE CASCADE ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_created_by_discord_users_id_fkey" FOREIGN KEY ("created_by") REFERENCES "discord_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_dismissed_by_discord_users_id_fkey" FOREIGN KEY ("dismissed_by") REFERENCES "discord_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;