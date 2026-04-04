import { VersionedTransaction } from "@solana/web3.js"

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
    error?: string
}
export type SimulationResult = {
    success: boolean
    error?: string
    logs: string[]
    transaction: DeserializedTx
}
export type RpcEndpoint = {
    url: string
    latency?: number
    successRate?: boolean
}
export type Signature = string
export type TxStatus = "pending" | "confirmed" | "failed"
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