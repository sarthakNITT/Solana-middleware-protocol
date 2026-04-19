The Sendra transaction lifecycle is a rigorous 7-stage deterministic pipeline. By moving through these stages, Sendra eliminates the non-determinism inherent in standard Solana transaction submission. This section provides a deep technical dive into each state transition within the engine.

## Stage 1: Dynamic Routing & Cluster Discovery

The lifecycle begins with a "Network Mapping" phase. Sendra treats your configured RPC endpoints not as a static list, but as an active cluster.

- **The Freshness Benchmark**
  The engine pings every configured provider to measure **Slot Height Offset**. Unlike standard "ping" latency, slot height tells us how close the node is to the cluster's "tip" (the latest leader). A node with 50ms latency but 10 slots behind is penalized in favor of a node with 100ms latency but 0 slots behind.
- **Failover Logic**
  If a primary node returns a rate-limit error (HTTP 429) or is significantly lagging behind the cluster average, the Router blacklists it for the duration of the current execution attempt, ensuring your metadata (hashes/fees) is sourced from high-quality infrastructure.

## Stage 2: Intent Manifestation & Structural Building

Once a healthy RPC is selected, the engine "Builds" the transaction. 

- **The Blockhash Clock**
  Sendra fetches a `recentBlockhash` specifically from the freshest node discovered in Stage 1. This starts the 150-slot "validity window" at the latest possible moment, maximizing the transaction's "Time to Live" on the network.
- **ALT Resolution**
  If your transaction involves many accounts (common in DEX cross-marginal swaps), Sendra resolves the **Address Lookup Tables (ALTs)** and builds a Versioned Message. This ensures the 1232-byte packet limit is never exceeded, preventing structural transmission failures.

## Stage 3: Account-Level Fee Optimization

Sendra calculates the "Total Cost of Inclusion" using aLocalized Fee Market model.

- **Writable Account Scan**
  The engine scans the transaction's account meta-list to identify every account requiring a **Write Lock**. It then queries the `getRecentPrioritizationFees` RPC method specifically for these accounts.
- **Probabilistic Bidding**
  Sendra applies a statistical multiplier (defaulting to the 75th percentile of recent inclusions) plus a small safety buffer. This ensures your transaction isn't just "sent," but is priced to outbid other packets contending for the same specific writable state (e.g., a specific pool or mint account).

## Stage 4: Clean-Room simulation

Before a single byte is broadcast, Sendra performs a mandatory "Pre-flight Guard" simulation on the cluster.

- **Compute Unit (CU) Discovery**
  The simulation allows the engine to discover the exact CU requirement of your code. By injecting an explicit `SetComputeUnitLimit` instruction based on this data, the transaction becomes more "dense" and "appealing" to the leader's scheduler.
- **Logical Validation**
  If the simulation fails (e.g., "Slippage error" or "Insufficient funds"), Sendra halts immediately. This prevents the user from broadcasting a transaction that is guaranteed to fail, saving them time and priority fees.

## Stage 5: Non-Custodial signing

The optimized, simulated transaction buffer is passed to the `Signer` interface. 

- **Security Isolation**
  The SDK handles only the instruction logic and the network metadata. The actual signing of the `VersionedTransaction` occurs within your secure environment (HSM, Hardware Wallet, or Browser Extension). 
- **Signature Binding**
  The resulting signature is cryptographically bound to the specific blockhash fetched in Stage 2. If the broadcast fails and we need a refresh, we return to Stage 2 to fetch a new hash and re-request a signature.

## Stage 6: Broadcast & TPU Ingress

The signed transaction is broadcast via the selected RPC node.

- **Optimized Transmission**
  Sendra configures the submission with `skipPreflight: true`. Since we already performed a more rigorous simulation in Stage 4, skipping the redundant RPC-level pre-flight reduces latency by ~200ms and ensures the packet reaches the leader's TPU queue faster.

## Stage 7: The Recovery & Recursive Loop

The engine transitions into an "Observation" state, monitoring the cluster for confirmation. 

- **Failure Classification**
  If confirmation isn't detected within a slot-window (usually ~15 seconds), Sendra diagnoses the failure:
  - **Expiry**: The network tip moved too fast. -> Restart from Stage 2.
  - **Congestion**: The packet reached the leader but was ignored. -> Restart from Stage 3 with a **1.5x Fee Escalation**.
  - **RPC Failure**: The entry node crashed or lagged. -> Restart from Stage 1.
- **Persistent State**
  This loop repeats until the `maxRetries` threshold is hit, ensuring the transaction either lands on-chain or a definitive technical failure is returned.
