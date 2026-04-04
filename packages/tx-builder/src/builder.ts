import type { DeserializedTx, RpcEndpoint } from "@repo/types/index";
import { Connection } from "@solana/web3.js";
import { optimizeFee } from "@repo/fee-optimizer/optimize";

export async function rebuildTx(tx: DeserializedTx, RPC_URL: RpcEndpoint): Promise<DeserializedTx> {
    console.log("Called rebuildTx");
    const connection = new Connection(`${RPC_URL.url}`, "confirmed");
    const { blockhash } = await connection.getLatestBlockhash()
    tx.message.recentBlockhash = blockhash;
    return tx;
}