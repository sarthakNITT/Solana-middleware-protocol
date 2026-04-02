import { Signature, TxStatus } from "@repo/types/index";
import {
    Connection,
} from "@solana/web3.js";
import { SOLANA_DEVNET_RPC_URL } from "@repo/config/index";

export async function getTxStatus(signature: Signature): Promise<TxStatus> {
    console.log("called getTxStatus");
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const response = await connection.getSignatureStatus(signature);
    const err = response.value?.err;
    if (err) {
        console.log("Error while getting signatures from RPC");
        return "failed";
    }
    const status = response.value?.confirmationStatus;
    console.log(`Status: ${status}`);
    if (status === "processed") {
        return "pending";
    }
    else if (status === "confirmed" || status === "finalized") {
        return "confirmed";
    }
    else if (!status) {
        return "pending";
    }
    else {
        return "failed";
    }
}