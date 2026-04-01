import type { DeserializedTx } from "@repo/types/index";
import {
    Connection,
} from "@solana/web3.js";
import { SOLANA_ALCHEMY_RPC_URL } from "@repo/config/index"

export async function sendTx(tx: DeserializedTx): Promise<string> {
    const connection = new Connection(SOLANA_ALCHEMY_RPC_URL, "confirmed");
    let sig = await connection.sendTransaction(tx);
    return JSON.stringify(sig);
}
