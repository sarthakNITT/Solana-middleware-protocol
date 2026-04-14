import { SendraLog, SendraLogEvent } from "@repo/types";

export function log(event: SendraLogEvent, data: Partial<Omit<SendraLog, "event" | "timestamp">> = {}): SendraLog {
    const logObject: SendraLog = {
        event,
        timestamp: Date.now(),
        ...data
    };

    console.log(JSON.stringify(logObject));

    return logObject;
}
