This section addresses the deep architectural and operational questions developers encounter when integrating the Sendra reliability layer.

### Why is Sendra necessary if I already have "confirmed" commitment?

The `confirmed` commitment level (where 66% + of the stake has voted on the block) only tells you that a transaction **has been included**. It does nothing to assist in the process of **getting it included**. Most transaction failures occur in the "Ingress" stage (getting the packet to the leader) or the "Construction" stage (choosing a blockhash). Sendra focuses on the "Pre-Commitment" segment of the transaction lifecycle, ensuring that the packet is properly priced, routed, and structurally valid to survive the network's high-entropy propagation path.

### Does the recursive retry loop risk a "Double Spend"?

No. Solana’s fundamental consensus rules make double-spending via multiple retries impossible at the protocol level. Each transaction is uniquely identified by its signature. If Sendra's engine attempts to "Refresh" a transaction, it fetches a **new blockhash**. 
1. The original transaction is bound to Hash A.
2. The retry transaction is bound to Hash B.
Sendra ensures that retry attempts occur only after a confirmation timeout has elapsed. If Hash A eventually lands, Hash B becomes structurally invalid. If Hash A expires, Hash B is the only valid candidate for inclusion. There is never a state where both can execute simultaneously because they derive from the same sequence of instructions and the same signer nonce.

### How does Sendra's Fee Optimizer differ from global fee estimates?

Most "priority fee" APIs provide a global median fee for the entire Solana cluster. This is historically inaccurate for specific high-demand programs (e.g., a trending NFT mint). 
Sendra's **Fee Optimizer** uses an "Account-Specific Scoping" algorithm. It parses your transaction instructions, extracts the `writable` account keys, and queries the `getRecentPrioritizationFees` RPC method specifically for that set of keys. This gives you the "Local Market Rate"—ensuring you pay exactly what is necessary for the specific resource you are contending for, rather than an arbitrary global average that might be too high (wasting money) or too low (preventing inclusion).

### What is the overhead of using the Sendra SDK?

On the **first successful attempt**, Sendra introduces a nominal latency overhead of ~200-400ms. This is the time required to perform the RPC benchmarking, account fee calculations, and the mandatory pre-flight simulation. 
However, this overhead is a "Reliability Investment." By ensuring the transaction is properly configured, the probability of it landing on the first attempt increases by orders of magnitude compared to a standard `sendTransaction` call. During periods of 20% + network congestion, using Sendra is significantly **faster** overall, as it prevents the 60-second "Signature Expired" timeout that plagues unoptimized implementations.

### Can I use Sendra with hardware wallets (Ledger)?

Yes. Because Sendra follows a non-custodial callback pattern for signing, it is fully compatible with hardware wallets. However, developers must account for the **UX of Re-signing**. 
If a transaction fails and Sendra triggers a reconstruction (refreshing the blockhash), the user will be prompted to approve the transaction on their device again. For this reason, we recommend setting a modest `maxRetries` (e.g., 3-5) for interactive wallet sessions and using the Sendra `logger` to provide clear instructions to the user (e.g., "Network congested. Please approve the re-price request on your Ledger.").

### How does the Dynamic Router handle 429 (Rate Limit) errors?

Modern high-performance RPC providers (Helius, Triton, QuickNode) use aggressive rate-limiting based on compute units. When the Sendra **Dynamic Router** receives a `429 Too Many Requests` status, it doesn't just surface an error. 
It instantly blacklists the specific provider URL for the current execution cycle and rotates to the next healthiest provider in your configuration. This architecture ensures that a single rate-limited API key or a regional provider outage does not cause a terminal failure in your application's execution flow.
