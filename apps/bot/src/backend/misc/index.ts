import { HonoBase } from "../app";
import { config } from "@thanos/constants";

export const miscRouter = new HonoBase()
  .get("/", (c) => {
    return c.text("Hello World!");
  })
  .get("/heartbeat", (c) => {
    return c.text("pong");
  })
  .get("/config", (c) => {
    return c.json({ ...config, updatedAt: new Date().toISOString() });
  });
