import type { DeserializedTx } from "@repo/types/index"
import { rebuildTx } from "@repo/tx-builder/builder";
import { sendTx } from "@repo/rpc-client/send"
import { optimizeFee } from "@repo/fee-optimizer/optimize";
import { selectRpc } from "@repo/router/router";
export async function retryTx(tx: DeserializedTx, fee: number) {
    console.log("Called retryTx");
    const bestRPC = await selectRpc();
    const newTx = await rebuildTx(tx, bestRPC);
    const optimize = await optimizeFee(newTx, bestRPC, fee);
    const signature = await sendTx(optimize.transaction, bestRPC);
    return {
        tx: optimize.transaction,
        signature,
        fee: optimize.fee
    };
}