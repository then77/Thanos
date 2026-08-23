import { SlashCommandSubcommandBuilder } from "discord.js";
import { defineCommand } from "@/lib/commands";

export default defineCommand({
    data: new SlashCommandSubcommandBuilder()
        .setName("warn")
        .setDescription("Warn a member"),
    execute: async (interaction) => {
        // ...
    },
});
