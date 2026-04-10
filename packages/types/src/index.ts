import { PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js"

export type SendraError = {
  type: "SIMULATION_FAIL" | "RPC_ERROR" | "TIMEOUT" | "UNKNOWN"
  message: string
  details?: any
}

export type SerializedTx = Uint8Array
export type TxRequest = {
    transaction: SerializedTx
    user: string
    options?: {
        maxRetries: number
    }
}
export type TxResponseStatus = "success" | "failed"
export type TxResponse = {
    status: TxResponseStatus
    signature?: string
    attempts: number
    logs: string[]
    error?: SendraError
}
export type SimulationResult = {
    success: boolean
    error?: SendraError
    logs: string[]
    transaction: DeserializedTx
}
export type RpcEndpoint = {
    url: string
    latency?: number
    successRate?: boolean
}
export type Signature = string
export type TxStatus = "pending" | "confirmed" | "failed" | "timeout"
export type context = {
    attempts: number
    maxRetries: number
}
export type message = string
export type meta = Record<string, any>
export type DeserializedTx = VersionedTransaction
export type OptimizedTx = {
    transaction: DeserializedTx
    fee: number
}
export type Signer = {
    publicKey: PublicKey;
    signTransaction(tx: DeserializedTx): Promise<DeserializedTx>;
};

export type SendraParams = {
    receiver: PublicKey;
    amount: number;
};

export type SendraOptions = {
    maxRetries: number;
};

export type SendraResult = {
    signature?: string;
    status: "confirmed" | "failed";
    attempts: number;
    error?: SendraError;
    logs?: SendraLog[];
};
export type SendraLog = {
    step: string
    message: string
    rpc?: string
    attempt?: number
    fee?: number
    reason?: "timeout" | "rpc_error" | "failed" | string
}