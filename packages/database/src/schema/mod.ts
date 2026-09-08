import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  index,
  pgEnum,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { discordUsers } from "./base";

export const actionTypeEnum = pgEnum("action_type", [
  "warn",
  "timeout",
  "kick",
  "softban",
  "tempban",
  "ban",
  "unwarn",
  "untimeout",
  "unban",
]);

export const actions = pgTable(
  "actions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    caseId: text("case_id").notNull(),
    discordId: uuid("discord_id")
      .notNull()
      .references(() => discordUsers.id, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),

    type: actionTypeEnum("type").notNull(),
    reason: text("reason"),
    auto: boolean("auto").default(false), // Auto means its an action taken by bot itself.
    meritPenalty: integer("merit_penalty"), // Calculated penalty.
    afterMerit: integer("after_merit"), // Merit count recorded after penalty at time of action.

    evidenceId: text("message_id"),
    evidenceContent: text("message_content"),
    evidenceImage: text("evidence_image"), // Plan s3

    // For linking action taken before/after.
    // ex: unmute action #a1b2 links => mute action #a1b2
    // TODO: unknown useful case yet
    linkedActionId: uuid("linked_action_id"),

    // TODO: link this ref to either user on better-auth or discord user
    createdBy: uuid("created_by").notNull(),
    dismissedBy: uuid("dismissed_by"),

    expiresAt: timestamp("expires_at"),
    dismissedAt: timestamp("dismissed_at"),

    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },

  (table) => [
    uniqueIndex("actions_caseId_uidx").on(table.caseId),
    index("actions_discordId_createdAt_idx").on(
      table.discordId,
      table.createdAt.desc(),
    ),
  ],
);
export type Action = typeof actions.$inferSelect;
export type NewAction = typeof actions.$inferInsert;
