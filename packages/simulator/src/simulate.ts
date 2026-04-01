import type { SimulationResult, DeserializedTx } from "@repo/types/index"
import {
    Connection,
    clusterApiUrl
} from "@solana/web3.js";

export async function simulateTx(tx: DeserializedTx): Promise<SimulationResult> {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const res = await connection.simulateTransaction(tx);
    return {
        success: !res.value?.err,
        error: res.value?.err ? JSON.stringify(res.value.err) : "none",
        logs: res.value?.logs || []
    }
}