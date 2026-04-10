import type { DeserializedTx, RpcEndpoint, SendraError } from "@repo/types/index";
import {
    Connection,
} from "@solana/web3.js";
import { SOLANA_DEVNET_RPC_URL } from "@repo/config/index"

export async function SendTx(tx: DeserializedTx, RPC_URL: RpcEndpoint): Promise<{ success: true, signature: string } | { success: false, error: SendraError }> {
    try {
        const connection = new Connection(`${RPC_URL.url}`, "confirmed");
        let sig = await connection.sendTransaction(tx);
        return { success: true, signature: sig };
    } catch (e: any) {
        return {
            success: false,
            error: {
                type: "RPC_ERROR",
                message: e.message || String(e)
            }
        };
    }
}
