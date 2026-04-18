import type { DeserializedTx, OptimizedTx, RpcEndpoint } from "@repo/types";
import { Connection } from "@solana/web3.js";
import { applyPriorityFee } from "@repo/tx-builder";

export async function optimizeFee(tx: DeserializedTx, RPC_URL: RpcEndpoint, prevFee?: number): Promise<OptimizedTx> {
    try {
        console.log("Starting fee optimization...");
        let newFee: number;

        if (prevFee !== undefined) {
            console.log("Previous fee provided:", prevFee);
            const connection = new Connection(`${RPC_URL.url}`, "confirmed");
            const fees = await connection.getRecentPrioritizationFees();
            const validFees = fees
                .map(f => f.prioritizationFee)
                .filter(f => f > 0)
                .sort((a, b) => a - b);
            let p75 = prevFee;
            if (validFees.length > 0) {
                const index = Math.floor(validFees.length * 0.75);
                p75 = validFees[index]!;
            }
            newFee = Math.max(Math.floor(prevFee * 1.3), p75);
            console.log("Calculated 1.3x increased fee:", newFee);

            const newTxWithFee = await applyPriorityFee(tx, newFee);
            return {
                transaction: newTxWithFee,
                fee: newFee
            }
        } else {
            console.log("No previous fee. Fetching recent prioritization fees from cluster...");
            const connection = new Connection(`${RPC_URL.url}`, "confirmed");
            const getFee = await connection.getRecentPrioritizationFees();

            let validFees: number[] = [];

            for (let i = 0; i < getFee.length; i++) {
                const feeObject = getFee[i];
                if (feeObject !== undefined) {
                    const extractedFee = feeObject.prioritizationFee;
                    if (extractedFee > 0) {
                        validFees.push(extractedFee);
                    }
                }
            }

            console.log("Found valid priority fees:", validFees.length);

            let baseFee: number = 0;

            if (validFees.length !== 0) {
                validFees.sort((a, b) => a - b)
                const length = validFees.length;
                const half = Math.floor(length / 2);

                if (length % 2 !== 0) {
                    baseFee = validFees[half]!;
                } else {
                    const firstMiddle = validFees[half - 1]!;
                    const secondMiddle = validFees[half]!;
                    baseFee = Math.floor((firstMiddle + secondMiddle) / 2);
                }
            }

            console.log("Final base fee calculated:", baseFee);

            const newTxWithFee = await applyPriorityFee(tx, baseFee);
            return {
                transaction: newTxWithFee,
                fee: baseFee
            }
        }
    } catch (error: any) {
        console.log("Error during fee optimization:", error.message);
        throw new Error(`Error from OptimizeFee: ${error.message}`)
    }
}