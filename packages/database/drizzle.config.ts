import { defineConfig } from "drizzle-kit";
import { env } from "@thanos/env";

export default defineConfig({
  out: "./src/drizzle-migrations",
  schema: "./src/schema/index.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
