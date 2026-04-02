import type { TxRequest, TxResponse } from "@repo/types/index"
import { simulateTx } from "@repo/simulator/simulate"
import { sendTx } from "@repo/rpc-client/send"
import { getTxStatus } from "@repo/rpc-client/status"

export const HandleTx = async (req: TxRequest): Promise<TxResponse> => {
    const serialisedTransaction = req.transaction;
    const txBytes =
        typeof serialisedTransaction === "string"
            ? Buffer.from(serialisedTransaction, "base64")
            : serialisedTransaction;
    const simulate_result = await simulateTx(txBytes);
    const deserializedTransaction = simulate_result.transaction;
    if (simulate_result.success) {
        const signature = await sendTx(deserializedTransaction)
        return new Promise((resolve) => {
            const interval = setInterval(async () => {
                const status = await getTxStatus(signature);
                if (status === "confirmed") {
                    clearInterval(interval);
                    resolve({
                        status: "success",
                        signature: signature,
                        attempts: 1,
                        logs: simulate_result.logs,
                        error: "none"
                    });
                } else if (status === "failed") {
                    clearInterval(interval);
                    resolve({
                        status: "failed",
                        signature: signature,
                        attempts: 1,
                        logs: ["Transaction failed"],
                        error: "Transaction failed"
                    });
                }
            }, 1000);
        });
    } else {
        return {
            status: "failed",
            attempts: 0,
            logs: simulate_result.logs,
            error: simulate_result.error
        }
    }
}