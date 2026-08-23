import { SlashCommandBuilder } from "discord.js";
import { defineCommand } from "@/lib/commands";
import warn from "./warn";

export default defineCommand({
    data: new SlashCommandBuilder()
        .setName("mod")
        .setDescription("Moderation commands")
        .addSubcommand(warn.data),
});