import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { db } from "@thanos/database";
import { env } from "@thanos/env";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  secret: env.BETTER_AUTH_SECRET,
});
