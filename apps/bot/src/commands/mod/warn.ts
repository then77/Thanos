import { SlashCommandSubcommandBuilder } from "discord.js";
import { defineCommand } from "@/lib/commands";

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
        .setDescription("User to give warn")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for warning or choose preset")
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
    ),
  autocomplete: {
    reason: async ({ focused }) => findPresetChoices(focused.value),
  },
  execute: async (interaction) => {
    // TODO: Temporary debug for now
    const user = interaction.options.getUser("user", true);
    const reason = interaction.options.getString("reason", true);
    const selectedPreset = reason.startsWith("preset:")
      ? PRESETS.find((preset) => preset.id === Number(reason.slice(7)))
      : undefined;
    const points =
      interaction.options.getInteger("points") ?? selectedPreset?.points ?? 5;

    await interaction.reply(
      [
        '### Test',
        `User: ${user.id}`,
        selectedPreset
          ? `Reason: ${selectedPreset.name} (preset ${selectedPreset.id})`
          : `Reason: ${reason}`,
        `Points: ${points}`,
      ].join("\n"),
    );
  },
});
