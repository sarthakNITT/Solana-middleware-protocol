import { RpcEndpoint, Signature, SendraError } from "@repo/types/index";
import { getTxStatus } from "@repo/rpc-client/status"

function sleep(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
}

export async function ConfirmTx(rpc: RpcEndpoint, signature: Signature, intervalMs: number = 1000, timeoutMs: number = 60000) {
    try {
        const start = Date.now();

        while (true) {
            const status = await getTxStatus(signature, rpc);
            if (status === "confirmed") {
                return { success: true, signature };
            }

            if (status === "failed") {
                const error: SendraError = { type: "UNKNOWN", message: "Transaction failed" };
                return { success: false, signature, error };
            }

            if (Date.now() - start > timeoutMs) {
                const error: SendraError = { type: "TIMEOUT", message: "Transaction confirmation timeout" };
                return { success: false, signature, error };
            }

            await sleep(intervalMs);
        }
    } catch (e: any) {
        const error: SendraError = { type: "RPC_ERROR", message: e.message || String(e) };
        return { success: false, signature, error };
    }
}
