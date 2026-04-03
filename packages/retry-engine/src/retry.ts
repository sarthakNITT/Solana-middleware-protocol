import type { DeserializedTx } from "@repo/types/index"
import { rebuildTx } from "@repo/tx-builder/builder";
import { sendTx } from "@repo/rpc-client/send"
import { optimizeFee } from "@repo/fee-optimizer/optimize";

export async function retryTx(tx: DeserializedTx, fee: number) {
    console.log("Called retryTx");
    const newTx = await rebuildTx(tx);
    const optimize = await optimizeFee(newTx, fee);
    const signature = await sendTx(optimize.transaction);
    return {
        tx: optimize.transaction,
        signature,
        fee: optimize.fee
    };
}