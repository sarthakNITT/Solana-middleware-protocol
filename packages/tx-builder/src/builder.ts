import type { DeserializedTx, RpcEndpoint, SendraParams, Signer } from "@repo/types";
import { Connection, PublicKey, SystemProgram, TransactionMessage, VersionedTransaction } from "@solana/web3.js";

export async function BuildTx(rpc: RpcEndpoint, signer: Signer, params: SendraParams): Promise<DeserializedTx> {
    try {
        const connection = new Connection(`${rpc.url}`, "confirmed");
        const senderAdd = new PublicKey(signer.publicKey);
        const receiverAdd = new PublicKey(params.receiver);
        const { blockhash } = await connection.getLatestBlockhash();
        const instruction = SystemProgram.transfer({
            fromPubkey: senderAdd,
            toPubkey: receiverAdd,
            lamports: params.amount
        })
        const message = new TransactionMessage({
            payerKey: senderAdd,
            instructions: [instruction],
            recentBlockhash: blockhash
        }).compileToV0Message();
        const tx = new VersionedTransaction(message);
        return tx;
    } catch (error) {
        throw new Error(`Error from BuildTx: ${error}`);
    }
}