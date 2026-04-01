import type { TxRequest, TxResponse } from "@repo/types/index"
import { simulateTx } from "@repo/simulator/simulate"

export const HandleTx = async (req: TxRequest): Promise<TxResponse> => {
    const transaction = req.transaction;
    const simulateResult = simulateTx(transaction);
    const res: TxResponse = {
        status: "success",
        signature: "Hello",
        attempts: 1,
        logs: ["heelo"]
    }
    return res;
}