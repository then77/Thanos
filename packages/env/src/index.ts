import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.url(),

    // Better Auth
    BETTER_AUTH_SECRET: z.string(),

    // Discord Bot
    DISCORD_ID: z.string(),
    DISCORD_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
});
