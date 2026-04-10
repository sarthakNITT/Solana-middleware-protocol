import { SendraError, SendraLog, SendraOptions, SendraParams, SendraResult, Signer } from "@repo/types/index";
import { selectRpc } from "@repo/router/router"
import { SimulateTx } from "@repo/simulator/simulate";
import { SendTx } from "@repo/rpc-client/send"
import { BuildTx } from "@repo/tx-builder/builder";
import { OptimizeFee } from "@repo/fee-optimizer/optimize";
import { ConfirmTx } from "@repo/logger/confirmTx";

export async function SendWithReliability(params: SendraParams, signer: Signer, options: SendraOptions): Promise<SendraResult> {
    const logs: SendraLog[] = [];
    const log = (entry: Partial<SendraLog> & { step: string }) => {
        logs.push({
            step: entry.step,
            message: entry.message || entry.step,
            rpc: entry.rpc,
            attempt: entry.attempt,
            fee: entry.fee,
            reason: entry.reason
        });
    };

    let attempt = 1;
    let rpc = await selectRpc();
    let currentRpcUrl = rpc.url;

    log({ step: "SELECTED_RPC", rpc: currentRpcUrl });
    let tx = await BuildTx(rpc, signer, params);
    log({ step: "BUILD_TX" });

    let optimisedTx = await OptimizeFee(tx, rpc);
    let lastFee = optimisedTx.fee;
    log({ step: "OPTIMIZE_FEE", fee: lastFee });

    let simResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
    log({ step: "SIMULATE_TX", message: `Simulated: ${simResult.success ? "Success" : "Failed"}` });

    if (!simResult.success) {
        return { status: "failed", attempts: attempt, error: simResult.error, logs };
    }

    let signedTx;
    try {
        signedTx = await signer.signTransaction(simResult.transaction);
        log({ step: "SIGN_TX" });
    } catch (e: any) {
        const error: SendraError = { type: "UNKNOWN", message: e.message || String(e) };
        return { status: "failed", attempts: attempt, error, logs };
    }

    let sendResult = await SendTx(signedTx, rpc);
    log({ step: "SEND", rpc: currentRpcUrl, attempt });

    let confirmResult;
    let retryReason = "";

    if (!sendResult.success) {
        retryReason = sendResult.error?.type === "RPC_ERROR" ? "rpc_error" : "failed";
    } else {
        const start = Date.now();
        confirmResult = await ConfirmTx(rpc, sendResult.signature!);
        const timeElapsed = Date.now() - start;

        log({ step: "CONFIRM_TX", message: `Confirm took ${timeElapsed}ms: ${confirmResult.success ? "Success" : "Failed"}`, rpc: currentRpcUrl, attempt });

        if (confirmResult.success) {
            return { status: "confirmed", signature: confirmResult.signature, attempts: attempt, logs };
        }

        if (confirmResult.error?.type === "TIMEOUT") retryReason = "timeout";
        else if (confirmResult.error?.type === "RPC_ERROR") retryReason = "rpc_error";
        else retryReason = "failed";
    }

    while (attempt < options.maxRetries) {
        attempt++;

        log({
            step: "RETRY",
            message: `[RETRY] attempt=${attempt} rpc=${currentRpcUrl} fee=${lastFee} reason=${retryReason}`,
            attempt: attempt,
            rpc: currentRpcUrl,
            fee: lastFee,
            reason: retryReason
        });

        rpc = await selectRpc();
        currentRpcUrl = rpc.url;
        log({ step: "SELECTED_RPC", rpc: currentRpcUrl });

        const newTx = await BuildTx(rpc, signer, params);
        log({ step: "BUILD_TX" });

        optimisedTx = await OptimizeFee(newTx, rpc, lastFee);
        lastFee = optimisedTx.fee;
        log({ step: "OPTIMIZE_FEE", fee: lastFee });

        simResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
        log({ step: "SIMULATE_TX", message: `Simulated: ${simResult.success ? "Success" : "Failed"}` });

        if (!simResult.success) {
            return { status: "failed", attempts: attempt, error: simResult.error, logs };
        }

        try {
            signedTx = await signer.signTransaction(simResult.transaction);
            log({ step: "SIGN_TX" });
        } catch (e: any) {
            const error: SendraError = { type: "UNKNOWN", message: e.message || String(e) };
            return { status: "failed", attempts: attempt, error, logs };
        }

        sendResult = await SendTx(signedTx, rpc);
        log({ step: "SEND", rpc: currentRpcUrl, attempt });

        if (!sendResult.success) {
            retryReason = sendResult.error?.type === "RPC_ERROR" ? "rpc_error" : "failed";
            continue;
        }

        const start = Date.now();
        confirmResult = await ConfirmTx(rpc, sendResult.signature!);
        const timeElapsed = Date.now() - start;

        log({ step: "CONFIRM_TX", message: `Confirm took ${timeElapsed}ms: ${confirmResult.success ? "Success" : "Failed"}`, rpc: currentRpcUrl, attempt });

        if (confirmResult.success) {
            return { status: "confirmed", signature: confirmResult.signature, attempts: attempt, logs };
        }

        if (confirmResult.error?.type === "TIMEOUT") retryReason = "timeout";
        else if (confirmResult.error?.type === "RPC_ERROR") retryReason = "rpc_error";
        else retryReason = "failed";
    }

    const maxRetriesError: SendraError = {
        type: "TIMEOUT",
        message: "Max retries exceeded"
    };

    return {
        status: "failed",
        attempts: attempt,
        error: maxRetriesError,
        logs
    };
}