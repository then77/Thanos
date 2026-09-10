import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { defineCommand } from "@/lib/commands";

import warn from "./warn";
import dismiss from "./dismiss";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("mod")
    .setDescription("Moderation commands")
    .setContexts(InteractionContextType.Guild)
    .addSubcommand(warn.data)
    .addSubcommand(dismiss.data),
  
});
