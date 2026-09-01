import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.url(),

    // Better Auth
    BETTER_AUTH_SECRET: z.string(),

    // Discord
    // DISCORD_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
});
