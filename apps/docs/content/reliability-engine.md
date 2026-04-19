The Sendra Reliability Engine is the core state machine that orchestrates the transaction lifecycle. It is responsible for diagnosing failures in real-time and executing recovery strategies without developer intervention.

## Architectural Overview

The Reliability Engine acts as a "Middle Manager" between your application logic and the Solana JSON-RPC layer. It is composed of three primary sub-systems working in tandem:

1. **The Monitor**: Subscribes to signature events and polls the cluster for inclusion status across multiple RPC providers.
2. **The Diagnostician**: Classifies why a transaction did not land (e.g., Expiry vs. Congestion vs. RPC Desync).
3. **The Orchestrator**: Triggers the rebuilding of the transaction with optimized parameters to overcome the specific failure detected.

## Failure Classification Matrix

The engine doesn't treat every failure the same. It uses a **Classification Matrix** to choose the most efficient recovery path:

- **BlockhashNotFound**
  - *Cause*: The transaction reached the leader but the cluster has moved past the 150-slot window.
  - *Strategy*: Refresh the hash and re-sign immediate replacement.
- **TransactionTimeout**
  - *Cause*: The packet was dropped by the leader's TPU or never left the entry RPC node due to congestion.
  - *Strategy*: Escalate the priority fee (1.5x) and rotate the target RPC provider.
- **RPC_LAG**
  - *Cause*: The node being used for simulation is behind the network tip.
  - *Strategy*: Penalize the current node in the Router and failover to the freshest provider.

## The Escalation Curve

To ensure eventual inclusion, the engine implements a non-linear **Escalation Curve** for priority fees. 

- **Level 1 (Entry)**: 25th percentile of the local market.
- **Level 2 (Retry)**: 50th percentile + buffer.
- **Level 3+ (Aggressive)**: 75th percentile with a strategic multiplier.

This curve ensures that during severe congestion (e.g., during a major airdrop claim), your transaction eventually bids high enough to break through the QUIC-based flow control at the leader level.

## Pre-flight Guard Integration

The Reliability Engine is tightly coupled with the **Pre-flight Simulator**. Before every retry attempt, the engine re-runs the simulation. This ensures that even if you are retrying a swap, the slippage and logical state are still valid. If the simulation fails (terminal failure), the engine stops the retry loop to prevent wasting fees on a logically impossible transaction.

## Developer Insight: The "Land at all Costs" Mode

By increasing the `maxRetries` and adjusting the commitment level to `finalized`, you can place the Reliability Engine into a "Land at all Costs" mode. This is particularly useful for administrative transactions or treasury management where the cost of a priority fee bump is negligible compared to the operational risk of a failed execution.
