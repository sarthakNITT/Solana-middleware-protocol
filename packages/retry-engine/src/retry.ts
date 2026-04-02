import type { DeserializedTx } from "@repo/types/index"
import { rebuildTx } from "@repo/tx-builder/builder";
import { sendTx } from "@repo/rpc-client/send"

export async function retryTx(tx: DeserializedTx) {
    console.log("Called retryTx");
    const newTx = await rebuildTx(tx);
    const signature = await sendTx(newTx);
    return {
        tx: newTx,
        signature
    };
}