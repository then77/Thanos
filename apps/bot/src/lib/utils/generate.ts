import { randomInt } from "crypto";

const ALPHANUMERIC = "abcdefghijklmnopqrstuvwxyz0123456789";

export function generateStringId(length = 8): string {
  return Array.from(
    { length },
    () => ALPHANUMERIC[randomInt(ALPHANUMERIC.length)],
  ).join("");
}
