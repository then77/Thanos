import { GatewayIntentBits } from "discord.js";
import { BotClient } from "@/client";
import { loadCommands } from "@/lib/commands";

const client = new BotClient({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});

/** Add handling on abnormal error */
process.on("uncaughtException", (error) => {
    client.logger.fatal(error, "Uncaught exception");
});
process.on("unhandledRejection", (reason) => {
    if (reason instanceof Error) {
        client.logger.error(reason, "Unhandled rejection");
    } else {
        client.logger.error({ reason }, "Unhandled rejection");
    }
});

if (!Bun.env.DISCORD_TOKEN) {
    throw new Error("DISCORD_TOKEN is not set yet.");
}

/** Load all commands */
const { commands } = await loadCommands(new URL("./commands", import.meta.url));
for (const command of commands.values()) {
    client.commands.set(command.data.toJSON().name, command);
}

await client.login(Bun.env.DISCORD_TOKEN);