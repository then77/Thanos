import { REST, Routes } from "discord.js";
import { env } from "@thanos/env";

const rest = new REST().setToken(env.DISCORD_TOKEN);

// for every guild-based commands
const guilds = (await rest.get(Routes.userGuilds())) as Array<{
  id: string;
  name: string;
}>;

console.log(`Found ${guilds.length} guild(s).`);
console.log(guilds.map((g) => `  ${g.id} - ${g.name}`).join("\n"));

await Promise.all(
  guilds.map(async (guild) => {
    try {
      await rest.put(
        Routes.applicationGuildCommands(env.DISCORD_ID, guild.id),
        { body: [] },
      );
      console.log(
        `Successfully deleted all guild commands inside ${guild.name} (${guild.id}).`,
      );
    } catch (error) {
      console.error(error);
    }
  }),
);

// for global commands
await rest.put(Routes.applicationCommands(env.DISCORD_ID), { body: [] });

console.log("Successfully deleted all global application commands.");
