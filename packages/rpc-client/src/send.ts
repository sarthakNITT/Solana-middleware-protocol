import type { RpcEndpoint, SerializedTx, Signature } from "@repo/types/index";
import {
    Connection,
    VersionedTransaction,
    clusterApiUrl
} from "@solana/web3.js";

export async function sendTx(tx: SerializedTx, rpc: RpcEndpoint): Promise<string> {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    let deserializedTx = VersionedTransaction.deserialize(tx);
    let sig = await connection.sendTransaction(deserializedTx);
    return JSON.stringify(sig);
}
