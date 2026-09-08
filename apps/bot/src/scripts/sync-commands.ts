import { REST, Routes } from "discord.js";
import { env } from "@thanos/env";
import { loadCommands } from "@/lib/commands";

const { commandData } = await loadCommands(
  new URL("../commands", import.meta.url),
);
const rest = new REST().setToken(env.DISCORD_TOKEN);

await rest.put(Routes.applicationCommands(env.DISCORD_ID), {
  body: commandData,
});

console.log(`Synchronized ${commandData.length} global application commands.`);
