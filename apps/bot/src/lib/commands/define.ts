import type {
  ApplicationCommandType,
  ChatInputCommandInteraction,
  ContextMenuCommandBuilder,
  MessageContextMenuCommandInteraction,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  UserContextMenuCommandInteraction,
} from "discord.js";

export type Awaitable<T> = T | Promise<T>;

export type ApplicationCommand =
  | ChatInputApplicationCommand
  | UserApplicationCommand
  | MessageApplicationCommand;

export type ChatInputCommandExecute = (
  interaction: ChatInputCommandInteraction,
) => Awaitable<void>;

type UserCommandExecute = (
  interaction: UserContextMenuCommandInteraction,
) => Awaitable<void>;

type MessageCommandExecute = (
  interaction: MessageContextMenuCommandInteraction,
) => Awaitable<void>;

type SlashCommandData =
  | SlashCommandBuilder
  | {
      toJSON(): ReturnType<SlashCommandBuilder["toJSON"]>;
    };

type SubcommandsOnlyCommandData = SlashCommandSubcommandsOnlyBuilder & {
  addStringOption?: never;
};

export type ChatInputApplicationCommand =
  | {
      data: SlashCommandData;
      execute: ChatInputCommandExecute;
    }
  | {
      data: SubcommandsOnlyCommandData;
      execute?: never;
    };

export interface ApplicationSubcommand {
  data: SlashCommandSubcommandBuilder;
  execute: ChatInputCommandExecute;
}

export interface ApplicationSubcommandGroup {
  data: SlashCommandSubcommandGroupBuilder;
}

export interface UserApplicationCommand {
  data: ContextMenuCommandBuilder & {
    readonly type: ApplicationCommandType.User;
  };

  execute: UserCommandExecute;
}

export interface MessageApplicationCommand {
  data: ContextMenuCommandBuilder & {
    readonly type: ApplicationCommandType.Message;
  };

  execute: MessageCommandExecute;
}

export type CommandModule =
  | ApplicationCommand
  | ApplicationSubcommand
  | ApplicationSubcommandGroup;

export type ExecutableChatInputCommand = Extract<
  ChatInputApplicationCommand,
  { execute: ChatInputCommandExecute }
>;

export type ExecutableApplicationCommand =
  | ExecutableChatInputCommand
  | UserApplicationCommand
  | MessageApplicationCommand;

export function defineCommand(
  command: ExecutableChatInputCommand,
): ExecutableChatInputCommand;
export function defineCommand(
  command: Extract<ChatInputApplicationCommand, { execute?: never }>,
): Extract<ChatInputApplicationCommand, { execute?: never }>;
export function defineCommand(
  command: UserApplicationCommand,
): UserApplicationCommand;
export function defineCommand(
  command: MessageApplicationCommand,
): MessageApplicationCommand;
export function defineCommand(
  command: ApplicationSubcommand,
): ApplicationSubcommand;
export function defineCommand(
  command: ApplicationSubcommandGroup,
): ApplicationSubcommandGroup;
export function defineCommand(command: CommandModule): CommandModule {
  return command;
}

export function subcommandToCommand(
  subcommand: ApplicationSubcommand,
): ExecutableChatInputCommand {
  const { type: _type, ...data } = subcommand.data.toJSON();

  return defineCommand({
    data: {
      toJSON: () => data,
    },
    execute: subcommand.execute,
  });
}
