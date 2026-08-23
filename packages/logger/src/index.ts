// src/logger.ts
import chalk from "chalk";
import pino from "pino";
import { mkdirSync } from "node:fs";
import { Writable } from "node:stream";

function getLogTimestamp() {
    const now = new Date();

    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const ss = String(now.getSeconds()).padStart(2, "0");

    return `${yy}-${mm}-${dd}-${hh}-${mi}-${ss}`;
}

const consoleStream = new Writable({
    write(chunk, _encoding, callback) {
        try {
            const log = JSON.parse(chunk.toString());

            const {
                level,
                time,
                pid,
                hostname,
                msg,
                err,
                stack,
                type,
                ...context
            } = log;

            const timestamp = chalk.gray(
                new Date(time).toLocaleTimeString("en-GB", {
                    hour12: false,
                }),
            );

            const levelBadge =
                level === "fatal"
                    ? chalk.bgRedBright.bold("FATAL")
                    : level === "error"
                      ? chalk.redBright.bold("ERROR")
                      : level === "warn"
                        ? chalk.yellow.bold("WARN ")
                        : level === "info"
                          ? chalk.greenBright.bold("INFO ")
                          : level === "debug"
                            ? chalk.cyanBright.bold("DEBUG")
                            : chalk.gray.bold("TRACE");

            const extra =
                Object.keys(context).length > 0
                    ? chalk.gray(` ${JSON.stringify(context)}`)
                    : "";

            const errorStack = err?.stack ?? stack;
            const stackLines =
                typeof errorStack === "string" ? errorStack.split("\n") : undefined;
            const message = stackLines?.[0] ?? msg ?? "";

            console.log(`${timestamp} ${levelBadge} ${message}${extra}`);

            if (stackLines && stackLines.length > 1) {
                console.error(stackLines.slice(1).join("\n"));
            } else if (err) {
                console.error(
                    `${err.type ?? type ?? "Error"}: ${err.message ?? "Unknown error"}`,
                );
            }

            callback();
        } catch (error) {
            callback(error as Error);
        }
    },
});

export const createLogger = (name: string) => {
    mkdirSync("logs", { recursive: true });

    const errorFileStream = pino.destination({
        dest: `logs/${name}-${getLogTimestamp()}.log`,
        sync: false,
    });

    return pino(
        {
            level: "trace",
            timestamp: pino.stdTimeFunctions.isoTime,

            formatters: {
                level(label) {
                    return { level: label };
                },
            },
        },
        pino.multistream([
            {
                level: Bun.env.LOG_LEVEL ?? "info",
                stream: consoleStream,
            },
            {
                level: "error",
                stream: errorFileStream,
            },
        ]),
    );
};

export type Logger = ReturnType<typeof createLogger>;
