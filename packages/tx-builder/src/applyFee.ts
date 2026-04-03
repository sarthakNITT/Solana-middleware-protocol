import type { DeserializedTx } from "@repo/types/index";
import {
    ComputeBudgetProgram,
    TransactionMessage,
    VersionedTransaction
} from "@solana/web3.js";

export async function applyPriorityFee(tx: DeserializedTx, fee: number): Promise<DeserializedTx> {
    const feeIx = ComputeBudgetProgram.setComputeUnitPrice({ microLamports: fee });
    const message = TransactionMessage.decompile(tx.message);
    message.instructions.unshift(feeIx);
    const newTxWithFee = new VersionedTransaction(message.compileToV0Message());
    return newTxWithFee;
}