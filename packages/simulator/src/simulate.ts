import type { SimulationResult, DeserializedTx, SerializedTx } from "@repo/types/index"
import {
    Connection,
    VersionedTransaction,
} from "@solana/web3.js";
import { SOLANA_DEVNET_RPC_URL } from "@repo/config/index"

export async function simulateTx(tx: SerializedTx): Promise<SimulationResult> {
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    let deserializedTx = VersionedTransaction.deserialize(tx);
    const res = await connection.simulateTransaction(deserializedTx);
    return {
        success: !res.value?.err,
        error: res.value?.err ? JSON.stringify(res.value.err) : "none",
        logs: res.value?.logs || [],
        transaction: deserializedTx
    }
}