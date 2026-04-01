import { Signature, TxStatus } from "@repo/types/index";
import {
    Connection,
    clusterApiUrl
} from "@solana/web3.js";

export async function getTxStatus(signature: Signature): Promise<TxStatus> {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const response = await connection.getSignatureStatus(signature);
    const err = response.value?.err;
    if (err) {
        return "failed";
    }
    const status = response.value?.confirmationStatus;
    if (status === "processed") {
        return "pending";
    }
    else if (status === "confirmed" || "finalised") {
        return "confirmed";
    }
    else if (!status) {
        return "pending";
    }
    else {
        return "failed";
    }
}