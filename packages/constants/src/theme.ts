const botColors = {
  default: 0x2b2d31,
  success: 0x2b2d31,
  warning: 0x2b2d31,
  danger: 0x2b2d31,
  error: 0x2b2d31,
} as const;

const botEmojis = {
  success: "",
  warn: "",
  error: "",

  id: "",
  channel: "",
  message: "",

  user: "",
  admin: "",

  user_warn: "",
  timeout: "",
  hammer: "",
} as const;

export type BotColorType = keyof typeof botColors;
export type BotEmojiType = keyof typeof botEmojis;
