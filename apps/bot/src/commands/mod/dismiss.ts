import { SlashCommandSubcommandBuilder } from "discord.js";
import { defineCommand } from "@/lib/commands";

import { db } from "@thanos/database";
import { actions, discordUsers } from "@thanos/database/schema";
import { eq } from "drizzle-orm";

export default defineCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("dismiss")
    .setDescription("Dismiss a mod action")
    .addStringOption((option) =>
      option
        .setName("case_id")
        .setDescription("User case id to dismiss.")
        .setRequired(true),
    ),
  execute: async (interaction) => {
    const caseId = interaction.options.getString("case_id");
    
    // Must alphanumeric and 8 length
    if (!caseId || !/^[a-zA-Z0-9]{8}$/.test(caseId)) {
      await interaction.reply({
        content: "Invalid case id.",
        ephemeral: true,
      });
      return;
    }

    const [result] = await db
      .select({ action: actions, discordUser: discordUsers })
      .from(actions)
      .innerJoin(discordUsers, eq(actions.discordId, discordUsers.id))
      .where(eq(actions.caseId, caseId.toLowerCase()))
      .limit(1);

    if (!result) {
      await interaction.reply({
        content: "No action found with that case id.",
        ephemeral: true,
      });
      return;
    }

    // TODO
    const createdAt = Math.floor(result.action.createdAt.getTime() / 1000);
    await interaction.reply({
      content: `Found case:
- Type: **\`${result.action.type}\`**
- User: <@${result.discordUser.discordId}>
- Reason: \`${result.action.reason ?? "No reason provided"}\`
- Created at: <t:${createdAt}:f>`,
    });
  },
});
