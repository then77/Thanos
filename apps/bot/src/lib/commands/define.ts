import type {
  ApplicationCommandType,
  ApplicationCommandOptionChoiceData,
  AutocompleteFocusedOption,
  AutocompleteInteraction,
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

export interface AutocompleteContext {
  interaction: AutocompleteInteraction;
  focused: AutocompleteFocusedOption;
}

export type AutocompleteChoices = readonly ApplicationCommandOptionChoiceData[];

export type AutocompleteHandler = (
  context: AutocompleteContext,
) => Awaitable<AutocompleteChoices>;

export type CommandAutocomplete =
  | AutocompleteHandler
  | Readonly<Record<string, AutocompleteHandler>>;

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
      autocomplete?: CommandAutocomplete;
    }
  | {
      data: SubcommandsOnlyCommandData;
      execute?: never;
    };

export interface ApplicationSubcommand {
  data: SlashCommandSubcommandBuilder;
  execute: ChatInputCommandExecute;
  autocomplete?: CommandAutocomplete;
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
    autocomplete: subcommand.autocomplete,
  });
}

export async function resolveAutocompleteChoices(
  autocomplete: CommandAutocomplete,
  context: AutocompleteContext,
): Promise<AutocompleteChoices> {
  const handler =
    typeof autocomplete === "function"
      ? autocomplete
      : autocomplete[context.focused.name];

  return handler ? await handler(context) : [];
}
