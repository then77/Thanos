import { SlashCommandSubcommandBuilder } from "discord.js";
import { defineCommand } from "@/lib/commands";

import { db } from "@thanos/database";
import { discordUsers, actions, type NewAction } from "@thanos/database/schema";
import { getOrInitDiscordUser } from "@/lib/utils/db";
import { eq } from "drizzle-orm";

import { resolveMessageEvidence } from "@/lib/utils/message";
import { generateStringId } from "@/lib/utils/generate";

const PRESETS = [
  { id: 1, name: "Spam chat", points: 5 },
  { id: 2, name: "Chat tidak senonoh", points: 5 },
  { id: 3, name: "Membuat drama", points: 10 },
  { id: 4, name: "Send NSFW", points: 25 },
  { id: 5, name: "Terlalu politik", points: 25 },
  { id: 6, name: "Send promosi", points: 5 },
];

function findPresetChoices(value: string | number) {
  const query = String(value).trim().toLocaleLowerCase();

  return PRESETS.filter((preset) =>
    preset.name.toLocaleLowerCase().includes(query),
  ).map((preset) => ({
    name: `${preset.id} — ${preset.name} (${preset.points} points)`,
    value: `preset:${preset.id}`,
  }));
}

export default defineCommand({
  data: new SlashCommandSubcommandBuilder()
    .setName("warn")
    .setDescription("Warn a member")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User to give warn.")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for warning or choose preset.")
        .setRequired(true)
        .setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option
        .setName("points")
        .setDescription(
          "Points to reduce. Default: 5, or based on preset if selected.",
        )
        .setRequired(false),
    )
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Attach message id/link as evidence.")
        .setRequired(false),
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("Attach image as evidence.")
        .setRequired(false),
    ),
  autocomplete: {
    reason: async ({ focused }) => findPresetChoices(focused.value),
  },
  execute: async (interaction) => {
    const author = interaction.user;

    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const selectedPreset = reason.startsWith("preset:")
      ? PRESETS.find((preset) => preset.id === Number(reason.slice(7)))
      : undefined;
    const points =
      interaction.options.getInteger("points") ?? selectedPreset?.points ?? 5;
    const rawMessageEvidence = interaction.options.getString("message");

    let rawImageEvidence = interaction.options.getAttachment("image");
    if (rawImageEvidence && !rawImageEvidence.contentType?.startsWith("image/")) {
      rawImageEvidence = null;
    }

    // Defer reply
    await interaction.deferReply();

    const discordUser = await getOrInitDiscordUser(user);
    if (!discordUser) {
      throw new Error("Unable to process as discord user data cant be found.");
    }

    // TODO: Decide to use discord user or auth user
    const authorUser = author;

    const messageEvidence = rawMessageEvidence
      ? await resolveMessageEvidence(interaction, rawMessageEvidence)
      : null;

    // TODO: Integrate s3 or smth for evidence image
    
    const actionValue: NewAction = {
      caseId: generateStringId(8),
      discordId: discordUser.id,

      type: "warn",
      reason: selectedPreset ? selectedPreset.name : reason,
      meritPenalty: points,
      afterMerit: discordUser.merit - points,

      evidenceId: messageEvidence?.id ?? null,
      evidenceContent: messageEvidence?.content ?? null,

      // TODO: still random
      createdBy: "77a591be-5261-423f-b93d-61282bc8dfb3",
    };

    const [action] = await db.insert(actions).values(actionValue).returning();
    if (!action) {
      throw new Error("Failed to create action case.");
    }

    // Do not use await here pls
    Promise.all([
      db
        .update(discordUsers)
        .set({ merit: discordUser.merit - points })
        .where(eq(discordUsers.id, discordUser.id)),
      
      // TODO: proper message.
      user.send({
        content:
          `${user.tag}, kamu telah di warn oleh moderator di **\`${interaction.guild?.name ?? "unknown"}\`** ` +
          `dan mendapat penalti **\`${points}\`** (**\`${discordUser.merit}->${discordUser.merit - points}\`**)`,
      }),
    ]);

    // TODO: proper message.
    await interaction.editReply({
      content: `${user.tag} punished. YATTA!!!!`,
    });
  },
});
