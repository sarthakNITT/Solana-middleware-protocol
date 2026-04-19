The Sendra Execution Model is a shift from the traditional "Push" model of blockchain transactions to an "Orchestration" model. This page explains the philosophy and the technical mechanics that allow Sendra to maintain a high inclusion rate during network stress.

## The Traditional Push Model (The Problem)

In a standard Solana dApp, the execution flow is linear:
1. Fetch Blockhash
2. Sign Transaction
3. `sendTransaction` (Push)
4. `confirmTransaction` (Wait)

If the transaction is not included within the 150-slot validity of the blockhash, the process fails. The developer is then responsible for manual recovery. In a congested network, this model frequently results in a "dead-end" where the user is left with no clear status.

## The Sendra Orchestration Model (The Solution)

Sendra treats the transaction signature not as the final product, but as a transient state in a larger lifecycle. The Sendra engine maintains the "Account-Level Intent" and autonomously manages the network-level metadata.

### 1. Intent Isolation
By separating the `TransactionInstruction` (the persistent intent) from the `recentBlockhash` (the transient metadata), Sendra can rebuild the transaction dozens of times without altering the user's objective.

### 2. Recursive Recovery
When a transaction fails to land, Sendra's engine enters a recovery state. It classifies the failure and chooses an optimized path:
- **Hash Refresh**: If the failure was due to time (expiry), only the hash is replaced.
- **Provider Failover**: If the failure was due to a specific RPC node lagging, the route is rotated.
- **Fee Escalation**: If the failure was due to network contention, the priority fee is "bumped" to secure better QoS tiers.

## The Physics of Inclusion

Sendra's model is designed to navigate the **TPU Ingress Layer**. When a leader processes blocks, it prioritizes transactions that are:
1. **Accurately Priced**: Matching the local market for writable accounts.
2. **Dense**: Declaring precise compute unit limits.
3. **Fresh**: Using a blockhash that was recently produced by the network tip.

The Sendra Execution Model ensures your transaction always meets these three criteria before it is broadcast.

## Real-World Impact on Throughput

By moving from Push to Orchestration, developers can achieve significantly higher "Land Rates" (the ratio of sent transactions to confirmed transactions). 

- **Reliability for Bots**: Ideal for arbitrage or liquidation bots where every failed attempt is lost profit.
- **Improved UX for Users**: Frontends no longer hang on "Waiting for Confirmation..."; instead, they provide active feedback as the engine navigates the network.

## Developer Insight: Deterministic Outcomes

The ultimate goal of the Sendra Execution Model is to turn transaction submission into a **Deterministic Outcome**. When you call `SendWithReliability`, you move from "I want to send this" to "Ensure this becomes part of the cluster state." This reliability is the foundation of institutional-grade blockchain infrastructure.
