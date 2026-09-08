import type { ChatInputCommandInteraction } from "discord.js";

const MESSAGE_ID_PATTERN = /^\d{17,20}$/;
const MESSAGE_LINK_PATTERN =
  /^https?:\/\/(?:(?:www|canary|ptb)\.)?discord(?:app)?\.com\/channels\/(?:@me|\d+)\/(\d+)\/(\d+)\/?$/i;

function parseMessageEvidence(rawEvidence: string) {
  const value = rawEvidence.trim();

  if (MESSAGE_ID_PATTERN.test(value)) {
    return { messageId: value };
  }

  const link = MESSAGE_LINK_PATTERN.exec(value);

  return link ? { channelId: link[1], messageId: link[2] } : null;
}

export async function resolveMessageEvidence(
  interaction: ChatInputCommandInteraction,
  rawEvidence: string | null,
): Promise<{ id: string; content: string | null } | null> {
  if (!rawEvidence) {
    return null;
  }

  const parsed = parseMessageEvidence(rawEvidence);

  if (!parsed || !parsed.messageId) {
    return null;
  }

  try {
    const channel = parsed.channelId
      ? await interaction.client.channels.fetch(parsed.channelId)
      : interaction.channel;

    if (channel?.isTextBased()) {
      const message = await channel.messages.fetch(parsed.messageId);

      const content =
        message.content.length > 4096
          ? `${message.content.slice(0, 4093)}...`
          : message.content;

      return { id: message.id, content };
    }
  } catch {
  }

  return { id: parsed.messageId, content: null };
}