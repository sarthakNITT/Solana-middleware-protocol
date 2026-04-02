import type { DeserializedTx, SerializedTx } from "@repo/types/index";
import {
    Connection
} from "@solana/web3.js";
export async function rebuildTx(tx: DeserializedTx): Promise<DeserializedTx> {
    console.log("Called rebuildTx");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const { blockhash } = await connection.getLatestBlockhash()
    tx.message.recentBlockhash = blockhash;
    return tx;
}