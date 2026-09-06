import { env } from "@thanos/env";
import { REST, Routes } from "discord.js";

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
    return await rest
      .put(Routes.applicationGuildCommands(env.DISCORD_ID, guild.id), {
        body: [],
      })
      .then(() => {
        console.log(
          `Successfully deleted all guild commands inside ${guild.name} (${guild.id}).`,
        );
        return true;
      })
      .catch((err) => {
        console.error(err);
        return false;
      });
  }),
);

// for global commands
await rest
  .put(Routes.applicationCommands(env.DISCORD_ID), { body: [] })
  .then(() => console.log("Successfully deleted all application commands."))
  .catch(console.error);
