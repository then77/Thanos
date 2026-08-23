import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  ApplicationCommandOptionType,
  Collection,
  type RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import type {
  ApplicationCommand,
  ApplicationSubcommand,
  ApplicationSubcommandGroup,
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

    subcommands.set(getSubcommandKey(filePath, command), command);
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
      };

      commands.set(data.name, executableCommand);
      commandData.push(data);
      continue;
    }

    if (isExecutableApplicationCommand(command)) {
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
  return command.data.toJSON().type === ApplicationCommandOptionType.Subcommand;
}

function isSubcommandGroup(
  command: CommandModule,
): command is ApplicationSubcommandGroup {
  return command.data.toJSON().type === ApplicationCommandOptionType.SubcommandGroup;
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

function getSubcommandKey(filePath: string, command: ApplicationSubcommand): string {
  const commandPath = filePath.split(/[\\/]/);
  const parentName = commandPath[0];
  const subcommandName = command.data.toJSON().name;

  if (commandPath.length > 2) {
    return `${parentName}:${commandPath[1]}:${subcommandName}`;
  }

  return `${parentName}:${subcommandName}`;
}
