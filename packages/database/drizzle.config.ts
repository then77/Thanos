import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle-migrations",
  schema: "./src/schema",
  dialect: "postgresql",
  dbCredentials: {
    // @ts-expect-error idk
    url: process.env.DATABASE_URL,
  },
});
