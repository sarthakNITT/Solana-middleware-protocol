Sendra is architected as a modular infrastructure suite. While the primary SDK provides a unified experience, the internal logic is subdivided into decoupled primitives that can be used independently for specialized infrastructure projects.

## 1. Dynamic Router (`@repo/router`)

The Dynamic Router is a weighted load-balancing engine specifically designed for Solana's asynchronous gossip architecture. It maintains a real-time "Health Map" of the RPC environment.

- **The Sync scoring Algorithm**
  The Router queries every node for its `getSlot` and `getEpochInfo`. It calculates the **Mean Cluster Height**. Nodes falling below one standard deviation of the cluster mean are instantly labeled "Stale" and deprioritized.
- **Latency vs. Value**
  Unlike standard load balancers that favor the lowest RTT (Round Trip Time), Sendra weighs the "Freshness" of the data. A node with 50ms latency but 5 slots behind the mean is considered higher-risk than a node with 80ms latency but 0 slots behind.

## 2. Transaction Builder & ALT Engine (`@repo/tx-builder`)

This package is responsible for the structural integrity of the transaction. It handles the mapping of legacy transaction logic into the **Versioned Message (v0)** format.

- **Immutability Assurance**
  The Builder ensures that during the "Refresh" stage of a retry, the core program instructions and account ordering are preserved exactly. This is critical for security, as it guarantees that a failure in the networking layer cannot lead to an unauthorized change in the transaction's business logic.
- **Dynamic ALT Resolution**
  The engine automatically detects when account counts exceed the 1232-byte packet limit and attempts to utilize Address Lookup Tables (ALTs) to "compress" the account metadata, ensuring the transaction remains valid for the TPU's entry requirement.

## 3. Fee Optimizer & Pricing Engine (`@repo/fee-optimizer`)

The Optimizer is an algorithmic engine for "inclusion certainty." It treats every transaction as a bid in a localized, high-frequency auction.

- **Localized Market Extraction**
  The Optimizer identifies the "Hot Paths" (writable accounts with high demand). It performs a historical scan of the last 150 slots for those specific accounts.
- **Escalation Multipliers**
  During recursive retries, the Optimizer applies a non-linear scaling curve to the priority fees. The goal is to dramatically increase the transaction's QoS (Quality of Service) tier with every failure, ensuring it eventually breaks through network congestion regardless of the volatility of the local fee market.

## 4. Pre-flight Simulator (`@repo/simulator`)

The Simulator is a clean-room isolation layer. It utilizes the cluster's simulation RPC calls to provide a "safety guard" before broadcast.

- **CU Discovery & Resource Injection**
  The simulator returns the precise **Compute Units (CU)** consumed by the instructions. Instead of using arbitrary high limits (which increase transaction "weight"), Sendra injects a precise `SetComputeUnitLimit` instruction to match the discovery.
- **Log Parsing & Intelligence**
  Simulator parses the base64-encoded program logs returned by the RPC node. It identifies terminal logical failures (like "Custom Error 0x1770" in Jupiter) and signals a total halt to the execution engine, preventing the waste of priority fees.

## 5. Persistent Retry Engine (`@repo/retry-engine`)

The "Brain" of Sendra. This state-machine orchestrates the interaction between all other modules. 

- **Failure Classification Matrix**
  The engine classifies every failure into a "Recovery Path":
  - **`BlockhashNotFound`**: Triggers a metadata refresh (Stage 2).
  - **`TransactionTimeout`**: Triggers a fee bump (Stage 3) and RPC rotation (Stage 1).
  - **`NodeBehind`**: Penalizes the current RPC node and rotates immediately.
- **Observation Strategy**
  The engine uses a hybrid of WebSocket subscriptions (`onSignature`) and aggressive polling (`getSignatureStatuses`) across multiple RPC nodes to ensure the latency between "Confirmed on Chain" and "Success in SDK" is minimized.
