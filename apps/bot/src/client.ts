import { Client, type ClientOptions } from "discord.js";
import { createLogger, type Logger } from "@thanos/logger";

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

    constructor(options: ClientOptions) {
        super(options);
        this.logger = createLogger("bot");
    }
}
