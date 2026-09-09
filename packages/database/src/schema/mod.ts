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

    // For linking action taken before/after.
    // ex: unmute action #a1b2 links => mute action #a1b2
    // TODO: unknown useful case yet
    linkedActionId: uuid("linked_action_id"),

    // TODO: link this ref to either user on better-auth or discord user
    createdBy: uuid("created_by")
      .notNull()
      .references(() => discordUsers.id, {
        onUpdate: "cascade",
        onDelete: "restrict",
      }),
    dismissedBy: uuid("dismissed_by").references(() => discordUsers.id, {
      onUpdate: "cascade",
      onDelete: "restrict",
    }),

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

export const actionEvidences = pgTable(
  "action_evidences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actionId: uuid("action_id")
      .notNull()
      .references(() => actions.id, {
        onUpdate: "cascade",
        onDelete: "cascade",
      }),
    messageId: text("message_id"),
    messageContent: text("message_content"),
    evidenceImage: text("evidence_image"),
    createdBy: uuid("created_by").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => [index("action_evidences_actionId_idx").on(table.actionId)],
);
export type ActionEvidence = typeof actionEvidences.$inferSelect;
export type NewActionEvidence = typeof actionEvidences.$inferInsert;
