import { LogEvent } from "@repo/types";

/**
 * TransactionFileLogger
 * 
 * Creates per-transaction debug log files in /sendra-logs/ directory.
 * Works in Node.js environments only — silently no-ops in browsers.
 * 
 * Usage:
 *   const fileLogger = new TransactionFileLogger();
 *   fileLogger.log(event);
 *   fileLogger.finalize(result);
 */

// Lazy-load Node.js modules — uses eval to prevent bundlers from resolving
let nodeFs: any = null;
let nodePath: any = null;
let nodeAvailable = false;

try {
    const isNode =
        typeof process !== "undefined" &&
        process.versions != null &&
        process.versions.node != null &&
        typeof window === "undefined";

    if (isNode) {
        // eval prevents webpack/turbopack from bundling these
        nodeFs = eval("require")("fs");
        nodePath = eval("require")("path");
        nodeAvailable = true;
    }
} catch {
    // Browser environment — file logging disabled
    nodeAvailable = false;
}

const ACTION_DESCRIPTIONS: Record<string, string> = {
    REBUILD_TX: "Rebuilding transaction with fresh blockhash",
    SWITCH_RPC: "Switching to different RPC endpoint",
    INCREASE_FEE: "Increasing priority fee to beat congestion",
};

function formatTimestamp(): string {
    return new Date().toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });
}

function formatDateForFilename(): string {
    const now = new Date();
    const y = now.getFullYear();
    const mo = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const h = String(now.getHours()).padStart(2, "0");
    const mi = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");
    return `${y}${mo}${d}-${h}${mi}${s}`;
}

function formatEventForFile(event: LogEvent): string {
    const ts = formatTimestamp();
    const lines: string[] = [`[${ts}] [${event.step}]`];

    switch (event.step) {
        case "RPC_SELECTED":
            lines.push(`  RPC: ${event.rpc || "unknown"}`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            break;

        case "TX_BUILT":
            lines.push(`  Transaction constructed`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            break;

        case "TX_LOADED":
            lines.push(`  Pre-built transaction loaded`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            break;

        case "FEE_OPTIMIZED":
            lines.push(`  Dynamic priority fee applied`);
            if (event.fee !== undefined) lines.push(`  Fee: ${event.fee} micro-lamports`);
            break;

        case "FEE_REOPTIMIZED":
            lines.push(`  Fee re-optimized for retry`);
            if (event.fee !== undefined) lines.push(`  New Fee: ${event.fee} micro-lamports`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            break;

        case "SIMULATION_SUCCESS":
            lines.push(`  ✓ Simulation passed — transaction is valid`);
            break;

        case "SIMULATION_FAILED":
            lines.push(`  ✗ Simulation failed — transaction would revert`);
            if (event.message) lines.push(`  Error: ${event.message}`);
            break;

        case "RETRY_SIMULATION_SUCCESS":
            lines.push(`  ✓ Retry simulation passed`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            break;

        case "RETRY_SIMULATION_FAILED":
            lines.push(`  ✗ Retry simulation failed`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            if (event.message) lines.push(`  Error: ${event.message}`);
            break;

        case "TX_SIGNED":
            lines.push(`  Transaction signed by wallet`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            break;

        case "TX_SENT":
            lines.push(`  Transaction broadcast to network`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            break;

        case "TX_CONFIRMED":
            lines.push(`  ═══ ✓ Transaction Confirmed On-Chain ═══`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            break;

        case "TX_CONFIRMED_AFTER_RETRY":
            lines.push(`  ═══ ✓ Confirmed after retry ═══`);
            if (event.attempt !== undefined) lines.push(`  Total Attempts: ${event.attempt}`);
            break;

        case "TX_NOT_CONFIRMED":
            lines.push(`  Transaction not confirmed — will retry`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            break;

        case "ATTEMPT_FAILED":
            lines.push(`  Initial attempt failed`);
            if (event.message) lines.push(`  Reason: ${event.message}`);
            break;

        case "RETRY_ATTEMPT":
            lines.push(`  ↻ Retry attempt #${event.attempt || "?"}`);
            lines.push(`  Re-routing through pipeline`);
            break;

        case "BLOCKHASH_EXPIRED":
            lines.push(`  Blockhash expired — rebuilding transaction`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            break;

        case "SEND_FAILED":
            lines.push(`  ✗ Send failed`);
            if (event.message) lines.push(`  Error: ${event.message}`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            break;

        case "RETRY_FAILED_REASON":
            lines.push(`  Failure classified: ${event.message || "unknown"}`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            break;

        case "ACTION":
            const desc = ACTION_DESCRIPTIONS[event.message || ""] || event.message || "";
            lines.push(`  → ${desc}`);
            break;

        case "MAX_RETRIES_EXCEEDED":
            lines.push(`  ✗ Maximum retries exceeded — transaction failed`);
            if (event.attempt !== undefined) lines.push(`  Total Attempts: ${event.attempt}`);
            break;

        default:
            if (event.message) lines.push(`  ${event.message}`);
            if (event.rpc) lines.push(`  RPC: ${event.rpc}`);
            if (event.fee !== undefined) lines.push(`  Fee: ${event.fee}`);
            if (event.attempt !== undefined) lines.push(`  Attempt: ${event.attempt}`);
            break;
    }

    return lines.join("\n");
}

export class TransactionFileLogger {
    private filePath: string | null = null;
    private enabled: boolean = false;
    private startTime: number;
    private eventCount: number = 0;

    constructor() {
        this.startTime = Date.now();

        if (!nodeAvailable || !nodeFs || !nodePath) {
            this.enabled = false;
            return;
        }

        try {
            const logsDir = nodePath.resolve(process.cwd(), "sendra-logs");

            // Create sendra-logs directory if it doesn't exist
            if (!nodeFs.existsSync(logsDir)) {
                nodeFs.mkdirSync(logsDir, { recursive: true });
            }

            const filename = `sendra-tx-${formatDateForFilename()}.log`;
            this.filePath = nodePath.join(logsDir, filename);

            // Write file header
            const header = [
                "╔══════════════════════════════════════════════════════╗",
                "║              SENDRA TRANSACTION DEBUG LOG           ║",
                "╚══════════════════════════════════════════════════════╝",
                "",
                `  Timestamp:  ${new Date().toISOString()}`,
                `  SDK:        Sendra v2.1.0`,
                `  Network:    Solana Devnet`,
                "",
                "──────────────────────────────────────────────────────",
                "",
            ].join("\n");

            nodeFs.writeFileSync(this.filePath, header, "utf-8");
            this.enabled = true;
        } catch {
            // If file creation fails, silently disable
            this.enabled = false;
        }
    }

    /**
     * Log a pipeline event to the transaction debug file.
     */
    log(event: LogEvent): void {
        if (!this.enabled || !this.filePath || !nodeFs) return;

        try {
            this.eventCount++;
            const formatted = formatEventForFile(event);
            nodeFs.appendFileSync(this.filePath, formatted + "\n\n", "utf-8");
        } catch {
            // Silent fail — don't break transactions due to logging
        }
    }

    /**
     * Write final summary and close the log file.
     */
    finalize(result: { success: boolean; signature?: string; attempts?: number; error?: string }): void {
        if (!this.enabled || !this.filePath || !nodeFs) return;

        try {
            const elapsed = Date.now() - this.startTime;
            const summary = [
                "──────────────────────────────────────────────────────",
                "",
                "  TRANSACTION SUMMARY",
                "",
                `  Status:      ${result.success ? "✓ CONFIRMED" : "✗ FAILED"}`,
                `  Signature:   ${result.signature || "n/a"}`,
                `  Attempts:    ${result.attempts || 1}`,
                `  Duration:    ${elapsed}ms`,
                `  Events:      ${this.eventCount}`,
                result.error ? `  Error:       ${result.error}` : "",
                "",
                "──────────────────────────────────────────────────────",
                `  Log file:    ${this.filePath}`,
                `  Generated:   ${new Date().toISOString()}`,
                "──────────────────────────────────────────────────────",
                "",
            ].filter(Boolean).join("\n");

            nodeFs.appendFileSync(this.filePath, summary, "utf-8");
        } catch {
            // Silent fail
        }
    }
}
