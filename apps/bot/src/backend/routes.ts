import { HonoBase } from "./app";
import { miscRouter } from "./misc";

export const router = new HonoBase().route("/", miscRouter);
export type RouterRoutes = typeof router;
