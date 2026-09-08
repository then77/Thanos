import { pgEnum, pgTable, text, uuid, timestamp, integer, boolean, uniqueIndex, index, foreignKey, primaryKey, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const actionType = pgEnum("action_type", ["warn", "timeout", "kick", "softban", "tempban", "ban", "unwarn", "untimeout", "unban"])


export const account = pgTable("account", {
	id: text().primaryKey(),
	issuer: text().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").notNull(),
}, (table) => [
	uniqueIndex("account_issuer_accountId_uidx").using("btree", table.issuer.asc().nullsLast(), table.accountId.asc().nullsLast()),
	index("account_userId_idx").using("btree", table.userId.asc().nullsLast()),
]);

export const actions = pgTable("actions", {
	id: uuid().defaultRandom().primaryKey(),
	caseId: text("case_id").notNull(),
	discordId: text("discord_id").notNull(),
	type: actionType().notNull(),
	reason: text(),
	auto: boolean().default(false),
	meritPenalty: integer("merit_penalty"),
	afterMerit: integer("after_merit"),
	messageId: text("message_id"),
	messageContent: text("message_content"),
	evidenceImage: text("evidence_image"),
	linkedActionId: uuid("linked_action_id"),
	createdBy: uuid("created_by").notNull(),
	dismissedBy: uuid("dismissed_by").notNull(),
	expiresAt: timestamp("expires_at"),
	dismissedAt: timestamp("dismissed_at"),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at"),
}, (table) => [
	uniqueIndex("actions_caseId_uidx").using("btree", table.caseId.asc().nullsLast()),
	index("actions_discordId_createdAt_idx").using("btree", table.discordId.asc().nullsLast(), table.createdAt.desc().nullsLast()),
]);

export const discordUsers = pgTable("discord_users", {
	id: uuid().defaultRandom().primaryKey(),
	discordId: text("discord_id").notNull(),
	merit: integer().default(100).notNull(),
	note: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at"),
}, (table) => [
	unique("discord_users_discord_id_key").on(table.discordId),]);

export const session = pgTable("session", {
	id: text().primaryKey(),
	expiresAt: timestamp("expires_at").notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" } ),
}, (table) => [
	index("session_userId_idx").using("btree", table.userId.asc().nullsLast()),
	unique("session_token_key").on(table.token),]);

export const user = pgTable("user", {
	id: text().primaryKey(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").default(false).notNull(),
	image: text(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
	unique("user_email_key").on(table.email),]);

export const verification = pgTable("verification", {
	id: text().primaryKey(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").default(sql`now()`).notNull(),
	updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
}, (table) => [
	index("verification_identifier_idx").using("btree", table.identifier.asc().nullsLast()),
]);
