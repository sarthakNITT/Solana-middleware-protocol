import type { DeserializedTx } from "@repo/types/index";
import {
    Connection,
} from "@solana/web3.js";
import { SOLANA_DEVNET_RPC_URL } from "@repo/config/index"

export async function sendTx(tx: DeserializedTx): Promise<string> {
    console.log("Called sendTx");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    let sig = await connection.sendTransaction(tx);
    return sig;
}
