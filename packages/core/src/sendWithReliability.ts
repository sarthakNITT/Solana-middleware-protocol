import { DeserializedTx, LogEvent, logs, SendraOptions, SendraParams, SerializedTx, Signer } from "@repo/types";
import { selectRpc } from "@repo/router"
import { SimulateTx } from "@repo/simulator";
import { SendTx } from "@repo/rpc-client"
import { BuildTx, newTxMessageFromOld } from "@repo/tx-builder";
import { optimizeFee } from "@repo/fee-optimizer";
import { ConfirmTx, classifyFailure } from "@repo/logger";
import { logEvent, TransactionFileLogger } from "@repo/logger";
import { Connection, VersionedTransaction } from "@solana/web3.js";

export async function SendWithReliability(params: SendraParams, signer: Signer, options: SendraOptions) {
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));
    let attempt = 0;
    const logs: logs = [];
    const logger = options?.logger;
    const fileLogger = new TransactionFileLogger();

    const rpc = await selectRpc();
    logEvent({
        step: "RPC_SELECTED",
        rpc: rpc.url,
    }, logs, logger, fileLogger);

    let tx: DeserializedTx, lastValidBlockHeight: number;
    let originalTx: DeserializedTx;
    if (params.type === "params") {
        const build = await BuildTx(rpc, signer, params);
        tx = build.tx;
        originalTx = tx;
        lastValidBlockHeight = build.lastValidBlockHeight;
        logEvent({
            step: "TX_BUILT",
            rpc: rpc.url
        }, logs, logger, fileLogger);
    }

    if (params.type === "built") {
        if (params.serializedTx === true) {
            tx = VersionedTransaction.deserialize(params.transaction);
            originalTx = tx;
        } else {
            tx = params.transaction;
            originalTx = tx;
        }
        const connection = new Connection(`${rpc.url}`, "confirmed");
        const { blockhash, lastValidBlockHeight: lvbh } = await connection.getLatestBlockhash();
        tx.message.recentBlockhash = blockhash;
        lastValidBlockHeight = lvbh;
        logEvent({
            step: "TX_LOADED",
            rpc: rpc.url
        }, logs, logger, fileLogger);
    }

    const optimisedTx = await optimizeFee(tx!, rpc);
    logEvent({
        step: "FEE_OPTIMIZED",
        fee: optimisedTx.fee
    }, logs, logger, fileLogger);

    const simulateResult = await SimulateTx(optimisedTx.transaction, rpc, signer);
    if (!simulateResult.success) {
        logEvent({
            step: "SIMULATION_FAILED",
            message: "failed"
        }, logs, logger, fileLogger);
        fileLogger.finalize({ success: false, error: simulateResult.error, attempts: attempt });
        return { success: false, error: simulateResult.error, logs };
    }
    logEvent({
        step: "SIMULATION_SUCCESS",
        message: "success"
    }, logs, logger, fileLogger);

    const signedTx = await signer.signTransaction(simulateResult.transaction);
    logEvent({
        step: "TX_SIGNED",
        attempt: attempt,
        rpc: rpc.url
    }, logs, logger, fileLogger);

    let sendFailed = false;
    let signature;

    try {
        signature = await SendTx(signedTx, rpc);
        logEvent({
            step: "TX_SENT",
            attempt: attempt,
            rpc: rpc.url
        }, logs, logger, fileLogger);
    } catch (error: any) {
        if (error.message?.includes("Blockhash not found") || error.message?.toLowerCase().includes("blockhash")) {
            logEvent({
                step: "BLOCKHASH_EXPIRED",
                attempt,
                rpc: rpc.url
            }, logs, logger, fileLogger);

            sendFailed = true;
        } else {
            logEvent({
                step: "SEND_FAILED",
                attempt: attempt,
                rpc: rpc.url,
                message: error.message
            }, logs, logger, fileLogger);
            fileLogger.finalize({ success: false, error: error.message, attempts: attempt });
            throw error;
        }
    }

    if (!sendFailed) {
        const result = await ConfirmTx(rpc, signature!, lastValidBlockHeight!);
        if (result.success) {
            logEvent({
                step: "TX_CONFIRMED",
                rpc: rpc.url,
            }, logs, logger, fileLogger);
            fileLogger.finalize({ success: true, signature: result.signature, attempts: attempt + 1 });
            return { ...result, logs };
        } else {
            logEvent({
                step: "TX_NOT_CONFIRMED",
                rpc: rpc.url,
            }, logs, logger, fileLogger);

            sendFailed = true;
        }
    }

    let lastFee = optimisedTx.fee;
    logEvent({
        step: "ATTEMPT_FAILED",
        attempt: attempt,
        message: "starting retries"
    }, logs, logger, fileLogger);

    while (attempt < options.maxRetries) {
        await sleep(500 + attempt * 300);
        let failureReason = "UNKNOWN";
        attempt++;
        logEvent({
            step: "RETRY_ATTEMPT",
            attempt: attempt
        }, logs, logger, fileLogger);

        const currentRpc = await selectRpc();
        logEvent({
            step: "RPC_SELECTED",
            attempt: attempt,
            rpc: currentRpc.url
        }, logs, logger, fileLogger);

        let newTx: VersionedTransaction;
        let newLastValidBlockHeight: number;

        if (params.type === "params") {
            const built = await BuildTx(currentRpc, signer, params);
            newTx = built.tx;
            newLastValidBlockHeight = built.lastValidBlockHeight;
        } else {
            const connection = new Connection(`${currentRpc.url}`, "confirmed");
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

            const message = newTxMessageFromOld(originalTx!, blockhash);
            newTx = new VersionedTransaction(message);
            originalTx = newTx;
            newLastValidBlockHeight = lastValidBlockHeight;
        }

        lastValidBlockHeight = newLastValidBlockHeight;
        logEvent({
            step: "TX_BUILT",
            rpc: currentRpc.url,
        }, logs, logger, fileLogger);

        const reOptimized = await optimizeFee(newTx, currentRpc, lastFee);
        logEvent({
            step: "FEE_REOPTIMIZED",
            attempt: attempt,
            fee: reOptimized.fee
        }, logs, logger, fileLogger);
        lastFee = reOptimized.fee;

        const sim = await SimulateTx(reOptimized.transaction, currentRpc, signer);
        if (!sim.success) {
            logEvent({
                step: "RETRY_SIMULATION_FAILED",
                attempt: attempt,
                message: "failed"
            }, logs, logger, fileLogger);
            fileLogger.finalize({ success: false, error: sim.error, attempts: attempt });
            return { success: false, error: sim.error, logs };
        }
        logEvent({
            step: "RETRY_SIMULATION_SUCCESS",
            attempt: attempt,
            message: "success"
        }, logs, logger, fileLogger);

        const signedTx = await signer.signTransaction(sim.transaction);
        logEvent({
            step: "TX_SIGNED",
            rpc: currentRpc.url,
        }, logs, logger, fileLogger);

        let signature;

        try {
            signature = await SendTx(signedTx, currentRpc);
            logEvent({
                step: "TX_SENT",
                attempt: attempt,
                rpc: currentRpc.url
            }, logs, logger, fileLogger);
        } catch (error: any) {
            failureReason = classifyFailure(error, null);
            logEvent({
                step: "RETRY_FAILED_REASON",
                attempt,
                message: failureReason
            }, logs, logger, fileLogger);
            if (failureReason === "BLOCKHASH_EXPIRED") {
                continue;
            }
            if (failureReason === "RPC_ERROR") {
                continue;
            }
            fileLogger.finalize({ success: false, error: error.message, attempts: attempt });
            throw error;
        }

        const result = await ConfirmTx(currentRpc, signature!, lastValidBlockHeight);
        if (!result.success) {
            failureReason = classifyFailure(null, result);

            logEvent({
                step: "RETRY_FAILED_REASON",
                attempt,
                message: failureReason
            }, logs, logger, fileLogger);
        }
        if (failureReason === "BLOCKHASH_EXPIRED") {
            logEvent({ step: "ACTION", message: "REBUILD_TX" }, logs, logger, fileLogger);
        }

        if (failureReason === "RPC_ERROR") {
            logEvent({ step: "ACTION", message: "SWITCH_RPC" }, logs, logger, fileLogger);
        }

        if (failureReason === "CONGESTION") {
            logEvent({ step: "ACTION", message: "INCREASE_FEE" }, logs, logger, fileLogger);
        }

        if (result.success) {
            logEvent({
                step: "TX_CONFIRMED_AFTER_RETRY",
                attempt: attempt
            }, logs, logger, fileLogger);
            fileLogger.finalize({ success: true, signature: result.signature, attempts: attempt });
            return { ...result, logs };
        }
    }
    logEvent({
        step: "MAX_RETRIES_EXCEEDED",
        attempt: attempt
    }, logs, logger, fileLogger);
    fileLogger.finalize({ success: false, error: "Max retries reached", attempts: attempt });
    return {
        success: false,
        error: "Max retries reached",
        attempts: attempt,
        logs
    };
}