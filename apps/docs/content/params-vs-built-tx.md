Sendra provides two primary ways to define your transaction intent: **Params-based** and **Pre-built**. Understanding the difference is crucial for integrating Sendra into existing workflows.

## 1. Params-based (`type: "params"`)

The "Params" mode is the native way to use Sendra. You provide raw `TransactionInstruction` objects, and the Sendra engine takes full responsibility for the transaction's structural assembly.

- **How it works**
  Sendra fetches a fresh blockhash, identifies the optimal priority fee for the included accounts, and builds a `VersionedMessage`. It then requests a signature from your `Signer`.
- **Ideal Use Case**
  Best for new features where you want Sendra to manage all network-level optimizations (fees, blockhashes, ALTs).

```typescript
const result = await SendWithReliability(
  {
    type: "params",
    instructions,
    payer: wallet.publicKey
  },
  wallet
);
```

## 2. Pre-built (`type: "built"`)

The "Built" mode is a wrapper for transactions that have already been constructed by an external service or a legacy builder.

- **How it works**
  Sendra accepts a `VersionedTransaction`. However, it doesn't just "Forward" it. Sendra **Deconstructs** the transaction to extract its instructions. During the retry loop, Sendra will rebuild the transaction from these original instructions with a fresh blockhash and updated fees.
- **Ideal Use Case**
  Integrating with external APIs like Jupiter, Raydium, or Cross-chain bridges where the transaction is delivered to you as a base64 buffer.

```typescript
const tx = VersionedTransaction.deserialize(buffer);
const result = await SendWithReliability(
  {
    type: "built",
    transaction: tx
  },
  wallet
);
```

## Comparative Analysis

| Feature | Params Mode | Built Mode |
| :--- | :--- | :--- |
| **Logic Source** | Individual Instructions | Completed Transaction |
| **Fee Management** | Full Sendra Control | Overwrites existing fees |
| **ALTs** | Managed by Developer | Pulled from original TX |
| **Signer Req** | Required every rebuild | Required every rebuild |

## Technical nuances of Built Mode

When using `type: "built"`, Sendra effectively treats the provided transaction as a **Blueprint**.

- **Instruction Extraction**: Sendra parses the `message` to recover the original instructions.
- **Metadata Refresh**: If the transaction is retried, Sendra replaces the `recentBlockhash` and recalibrates the `ComputeBudget` instructions for better priority.
- **Signature Invalidation**: Because the metadata changes, the original signature on the built transaction is discarded. This is why the `Signer` interface is still required.

## Developer Insight: Choosing the Right Mode

If you are building a dApp from scratch, use **Params Mode**. It offers the highest degree of structural flexibility and allows Sendra to perfectly optimize every metadata field. Use **Built Mode** only when you are forced to work with pre-signed or strictly pre-constructed transactions from 3rd-party aggregators.
