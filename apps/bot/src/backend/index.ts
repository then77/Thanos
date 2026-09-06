import { rateLimiter } from "hono-rate-limiter";
import { HonoBase } from "./app";
import { type RouterRoutes, router } from "./routes";

export const app = new HonoBase();
export type AppType = typeof app;

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each client to 100 requests per window
    keyGenerator: (c) => c.req.header("x-forwarded-for") ?? "", // Use IP address as key
  }),
);

export { router };
app.route("/", router);
