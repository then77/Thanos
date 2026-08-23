import { Client, Collection, type ClientOptions } from "discord.js";
import { createLogger, type Logger } from "@thanos/logger";
import type { ExecutableApplicationCommand } from "@/lib/commands";

export class BotClient extends Client {
    /**
     * The logger instance for the bot.
     *
     * @example
     * ```ts
     * client.logger.info("Bot is ready.");
     * client.logger.error(new Error("Something went wrong."));
     * ```
     */
    public readonly logger: Logger;

    /** Loaded commands */
    public readonly commands = new Collection<string, ExecutableApplicationCommand>();

    constructor(options: ClientOptions) {
        super(options);
        this.logger = createLogger("bot");
    }
}
