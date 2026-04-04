import type { SimulationResult, SerializedTx, RpcEndpoint } from "@repo/types/index"
import {
    Connection,
    VersionedTransaction,
} from "@solana/web3.js";

export async function simulateTx(tx: SerializedTx, RPC_URL: RpcEndpoint): Promise<SimulationResult> {
    console.log(`Called simulateTx`);
    const connection = new Connection(`${RPC_URL.url}`, "confirmed");
    const deserializedTx = VersionedTransaction.deserialize(tx);
    const res = await connection.simulateTransaction(deserializedTx);
    return {
        success: !res.value?.err,
        error: res.value?.err ? JSON.stringify(res.value.err) : "none",
        logs: res.value?.logs || [],
        transaction: deserializedTx
    }
}