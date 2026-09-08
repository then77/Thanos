import {
  ApplicationCommandType,
  MessageFlags,
  type AutocompleteInteraction,
  type CommandInteraction,
  type Interaction,
} from "discord.js";
import type { BotClient } from "@/client";
import { resolveAutocompleteChoices } from "./define";
import type {
  ExecutableApplicationCommand,
  ExecutableChatInputCommand,
  MessageApplicationCommand,
  UserApplicationCommand,
} from "./define";

type CommandClient = Pick<BotClient, "commands" | "logger">;

export function createCommandInteractionHandler(
  client: CommandClient,
): (interaction: Interaction) => Promise<void> {
  return async (interaction) => {
    try {
      if (interaction.isAutocomplete()) {
        await handleAutocomplete(client, interaction);
        return;
      }

      if (interaction.isCommand()) {
        await handleCommand(client, interaction);
      }
    } catch (error) {
      client.logger.error(error, "Failed to handle command interaction");
    }
  };
}

async function handleCommand(
  client: CommandClient,
  interaction: CommandInteraction,
): Promise<void> {
  const command = client.commands.get(interaction.commandName);

  if (!command) {
    client.logger.warn(
      { commandName: interaction.commandName },
      "No command handler found",
    );
    return;
  }

  try {
    if (
      interaction.isChatInputCommand() &&
      isExecutableChatInputCommand(command)
    ) {
      await command.execute(interaction);
      return;
    }

    if (
      interaction.isUserContextMenuCommand() &&
      isUserApplicationCommand(command)
    ) {
      await command.execute(interaction);
      return;
    }

    if (
      interaction.isMessageContextMenuCommand() &&
      isMessageApplicationCommand(command)
    ) {
      await command.execute(interaction);
      return;
    }

    throw new Error(
      `Interaction type does not match command: ${interaction.commandName}`,
    );
  } catch (error) {
    client.logger.error(error, `Command failed: ${interaction.commandName}`);
    await respondToCommandError(interaction);
  }
}

async function handleAutocomplete(
  client: CommandClient,
  interaction: AutocompleteInteraction,
): Promise<void> {
  const command = client.commands.get(interaction.commandName);
  const focused = interaction.options.getFocused(true);

  if (!command || !isExecutableChatInputCommand(command)) {
    client.logger.warn(
      {
        commandName: interaction.commandName,
        optionName: focused.name,
      },
      "No autocomplete command handler found",
    );
    await interaction.respond([]);
    return;
  }

  if (!command.autocomplete) {
    client.logger.warn(
      {
        commandName: interaction.commandName,
        optionName: focused.name,
      },
      "No autocomplete option handler found",
    );
    await interaction.respond([]);
    return;
  }

  try {
    const choices = await resolveAutocompleteChoices(command.autocomplete, {
      interaction,
      focused,
    });

    await interaction.respond([...choices].slice(0, 25));
  } catch (error) {
    client.logger.error(
      error,
      `Autocomplete failed: ${interaction.commandName}:${focused.name}`,
    );

    if (!interaction.responded) {
      await interaction.respond([]);
    }
  }
}

async function respondToCommandError(
  interaction: CommandInteraction,
): Promise<void> {
  const response = {
    content: "An unexpected error occurred while running this command.",
    flags: MessageFlags.Ephemeral,
  } as const;

  if (interaction.deferred || interaction.replied) {
    await interaction.followUp(response);
    return;
  }

  await interaction.reply(response);
}

function isExecutableChatInputCommand(
  command: ExecutableApplicationCommand,
): command is ExecutableChatInputCommand {
  const type = command.data.toJSON().type;

  return type === undefined || type === ApplicationCommandType.ChatInput;
}

function isUserApplicationCommand(
  command: ExecutableApplicationCommand,
): command is UserApplicationCommand {
  return command.data.toJSON().type === ApplicationCommandType.User;
}

function isMessageApplicationCommand(
  command: ExecutableApplicationCommand,
): command is MessageApplicationCommand {
  return command.data.toJSON().type === ApplicationCommandType.Message;
}
