import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  ApplicationCommandOptionType,
  ApplicationCommandType,
  Collection,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import { resolveAutocompleteChoices } from "./define";
import type {
  ApplicationCommand,
  ApplicationSubcommand,
  ApplicationSubcommandGroup,
  AutocompleteHandler,
  ChatInputApplicationCommand,
  CommandModule,
  ExecutableApplicationCommand,
  ExecutableChatInputCommand,
} from "./define";

interface LoadedCommandModule {
  command: CommandModule;
  filePath: string;
}

export interface LoadedCommands {
  commands: Collection<string, ExecutableApplicationCommand>;
  commandData: RESTPostAPIApplicationCommandsJSONBody[];
}

type CommandsDirectory = string | URL;

export async function loadCommands(
  directory: CommandsDirectory,
): Promise<LoadedCommands> {
  const loadedModules: LoadedCommandModule[] = [];
  const subcommands = new Collection<string, ApplicationSubcommand>();
  const commands = new Collection<string, ExecutableApplicationCommand>();
  const commandData: RESTPostAPIApplicationCommandsJSONBody[] = [];

  const commandsRoot = resolveCommandsRoot(directory);
  const glob = new Bun.Glob("**/*.ts");

  for await (const filePath of glob.scan(commandsRoot)) {
    const moduleUrl = pathToFileURL(path.resolve(commandsRoot, filePath)).href;
    const module = await import(moduleUrl);
    const command = module.default as CommandModule | undefined;

    if (!command?.data) {
      continue;
    }

    loadedModules.push({ command, filePath });
  }

  for (const { command, filePath } of loadedModules) {
    if (!isSubcommand(command)) {
      continue;
    }

    const key = getSubcommandKey(filePath, command);
    validateAutocompleteConfiguration(key, command);
    subcommands.set(key, command);
  }

  for (const { command } of loadedModules) {
    if (isSubcommand(command) || isSubcommandGroup(command)) {
      continue;
    }

    const data = command.data.toJSON();

    if (isSubcommandsOnlyCommand(command)) {
      const executableCommand: ExecutableChatInputCommand = {
        data: command.data,
        execute: createSubcommandRouter(data.name, subcommands),
        autocomplete: createSubcommandAutocompleteRouter(
          data.name,
          subcommands,
        ),
      };

      commands.set(data.name, executableCommand);
      commandData.push(data);
      continue;
    }

    if (isExecutableApplicationCommand(command)) {
      if (isExecutableChatInputCommand(command)) {
        validateAutocompleteConfiguration(data.name, command);
      }

      commands.set(data.name, command);
      commandData.push(data);
    }
  }

  return { commands, commandData };
}

function resolveCommandsRoot(directory: CommandsDirectory): string {
  if (directory instanceof URL) {
    return fileURLToPath(directory);
  }

  return path.isAbsolute(directory) ? directory : path.resolve(directory);
}

function isSubcommand(command: CommandModule): command is ApplicationSubcommand {
  return command.data instanceof SlashCommandSubcommandBuilder;
}

function isSubcommandGroup(
  command: CommandModule,
): command is ApplicationSubcommandGroup {
  return command.data instanceof SlashCommandSubcommandGroupBuilder;
}

function isSubcommandsOnlyCommand(
  command: ApplicationCommand,
): command is Extract<ChatInputApplicationCommand, { execute?: never }> {
  const data = command.data.toJSON();

  return (
    !("execute" in command) &&
    Array.isArray(data.options) &&
    data.options.some(
      (option) =>
        option.type === ApplicationCommandOptionType.Subcommand ||
        option.type === ApplicationCommandOptionType.SubcommandGroup,
    )
  );
}

function isExecutableApplicationCommand(
  command: ApplicationCommand,
): command is ExecutableApplicationCommand {
  return "execute" in command;
}

function isExecutableChatInputCommand(
  command: ExecutableApplicationCommand,
): command is ExecutableChatInputCommand {
  const type = command.data.toJSON().type;

  return type === undefined || type === ApplicationCommandType.ChatInput;
}

function createSubcommandRouter(
  commandName: string,
  subcommands: Collection<string, ApplicationSubcommand>,
): ExecutableChatInputCommand["execute"] {
  return async (interaction) => {
    const groupName = interaction.options.getSubcommandGroup(false);
    const subcommandName = interaction.options.getSubcommand();
    const key = groupName
      ? `${commandName}:${groupName}:${subcommandName}`
      : `${commandName}:${subcommandName}`;
    const subcommand = subcommands.get(key);

    if (!subcommand) {
      throw new Error(`No handler found for subcommand: ${key}`);
    }

    await subcommand.execute(interaction);
  };
}

function createSubcommandAutocompleteRouter(
  commandName: string,
  subcommands: Collection<string, ApplicationSubcommand>,
): AutocompleteHandler {
  return async (context) => {
    const groupName = context.interaction.options.getSubcommandGroup(false);
    const subcommandName = context.interaction.options.getSubcommand();
    const key = groupName
      ? `${commandName}:${groupName}:${subcommandName}`
      : `${commandName}:${subcommandName}`;
    const subcommand = subcommands.get(key);

    if (!subcommand?.autocomplete) {
      throw new Error(`No autocomplete handler found for subcommand: ${key}`);
    }

    return await resolveAutocompleteChoices(subcommand.autocomplete, context);
  };
}

function validateAutocompleteConfiguration(
  commandKey: string,
  command: ExecutableChatInputCommand | ApplicationSubcommand,
): void {
  const data = command.data.toJSON();
  const autocompleteOptionNames = (data.options ?? [])
    .filter(
      (option) =>
        "autocomplete" in option && option.autocomplete === true,
    )
    .map((option) => option.name);
  const autocomplete = command.autocomplete;

  if (autocompleteOptionNames.length === 0) {
    if (autocomplete) {
      throw new Error(
        `Command "${commandKey}" defines autocomplete handlers but has no autocomplete-enabled options`,
      );
    }

    return;
  }

  if (!autocomplete) {
    throw new Error(
      `Command "${commandKey}" has autocomplete-enabled options but no autocomplete handler`,
    );
  }

  if (typeof autocomplete === "function") {
    return;
  }

  const configuredOptionNames = Object.keys(autocomplete);
  const missingOptionNames = autocompleteOptionNames.filter(
    (name) => !configuredOptionNames.includes(name),
  );
  const unknownOptionNames = configuredOptionNames.filter(
    (name) => !autocompleteOptionNames.includes(name),
  );

  if (missingOptionNames.length > 0 || unknownOptionNames.length > 0) {
    const details = [
      missingOptionNames.length > 0
        ? `missing handlers for: ${missingOptionNames.join(", ")}`
        : undefined,
      unknownOptionNames.length > 0
        ? `unknown handlers for: ${unknownOptionNames.join(", ")}`
        : undefined,
    ]
      .filter(Boolean)
      .join("; ");

    throw new Error(
      `Invalid autocomplete configuration for command "${commandKey}": ${details}`,
    );
  }
}

function getSubcommandKey(filePath: string, command: ApplicationSubcommand): string {
  const commandPath = filePath.split(/[\\/]/);
  const parentName = commandPath[0];
  const subcommandName = command.data.toJSON().name;

  if (commandPath.length > 2) {
    return `${parentName}:${commandPath[1]}:${subcommandName}`;
  }

  return `${parentName}:${subcommandName}`;
}
