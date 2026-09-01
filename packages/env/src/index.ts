import { createEnv } from "@t3-oss/env-core";
import z from "zod";

export const env = createEnv({
  server: {
    // Database
    DATABASE_URL: z.url(),

    // Discord
    DISCORD_TOKEN: z.string(),
  },
  runtimeEnv: process.env,
});
