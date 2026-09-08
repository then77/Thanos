import { eq } from "drizzle-orm";
import { db } from "@thanos/database";
import {
  discordUsers,
  type DiscordUser,
  type NewDiscordUser,
} from "@thanos/database/schema";
import type { User } from "discord.js";

export async function getOrInitDiscordUser(
  user: User,
): Promise<DiscordUser | null> {
  const initValues: NewDiscordUser = {
    discordId: user.id,
    merit: 100,
  };

  let [discordUser] = await db
    .insert(discordUsers)
    .values(initValues)
    .onConflictDoNothing({ target: discordUsers.discordId })
    .returning();
  
  if (!discordUser) {
    [discordUser] = await db
      .select()
      .from(discordUsers)
      .where(eq(discordUsers.discordId, initValues.discordId))
      .limit(1);
  }

  return discordUser ?? null;
}
