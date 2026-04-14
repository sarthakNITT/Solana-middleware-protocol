import type { SimulationResult, SerializedTx, RpcEndpoint, DeserializedTx, Signer, SendraError } from "@repo/types"
import {
    Connection,
    VersionedTransaction,
} from "@solana/web3.js";

export async function SimulateTx(tx: DeserializedTx, RPC_URL: RpcEndpoint, signer: Signer): Promise<SimulationResult> {
    try {
        const connection = new Connection(`${RPC_URL.url}`, "confirmed");
        const serializedTx = tx.serialize();
        const deserializedTx = VersionedTransaction.deserialize(serializedTx);
        const res = await connection.simulateTransaction(deserializedTx);

        if (res.value?.err) {
            const error: SendraError = {
                type: "SIMULATION_FAIL",
                message: typeof res.value.err === "string" ? res.value.err : "Transaction simulation failed",
                details: res.value.logs
            };
            return {
                success: false,
                error,
                logs: res.value.logs || [],
                transaction: deserializedTx
            };
        }

        return {
            success: true,
            logs: res.value?.logs || [],
            transaction: deserializedTx
        }
    } catch (e) {
        const error: SendraError = {
            type: "UNKNOWN",
            message: e instanceof Error ? e.message : String(e),
            details: e
        };
        return {
            success: false,
            error,
            logs: [],
            transaction: tx
        }
    }
}