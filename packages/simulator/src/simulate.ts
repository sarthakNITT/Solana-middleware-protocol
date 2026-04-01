import type { SimulationResult, SerializedTx } from "@repo/types/index"

export function simulateTx(tx: SerializedTx): SimulationResult {
    const body = tx;
    const res: SimulationResult = {
        success: true,
        error: "none",
        logs: ["Hello"]
    }
    return res
}