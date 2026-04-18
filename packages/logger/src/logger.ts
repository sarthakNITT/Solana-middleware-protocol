import { LogEvent } from "@repo/types";

export function logEvent(
    event: LogEvent,
    logs?: LogEvent[],
    logger?: (log: LogEvent) => void
) {
    if (logs) logs.push(event);
    if (logger) logger(event);
    else console.log(JSON.stringify(event));
}