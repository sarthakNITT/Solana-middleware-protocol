# Failure Recovery

Demonstrates Sendra recovering from infrastructure failure. The default `.env.example` includes an intentionally unreachable local RPC endpoint first, followed by a healthy devnet endpoint.

Sendra probes the RPC pool, filters the unavailable endpoint, selects a healthy route, and continues the execution pipeline. If a broadcast or confirmation issue happens later, the retry loop rebuilds or refreshes the transaction, re-simulates, re-signs, and tries again up to `MAX_RETRIES`.

## Install

```bash
cd examples/failure-recovery
cp .env.example .env
bun install
```

## Run

```bash
bun run dev
```

You should see logs for:

- RPC pool health checks
- Routing around the unavailable RPC
- Retry-related lifecycle events when failures occur
- Blockhash refresh behavior when the network reports blockhash expiry
- Final confirmation or max retry exhaustion

## How To Force More Recovery Paths

- Set `SENDRA_DEVNET_URL_2` to a slow or flaky provider to observe routing changes.
- Temporarily lower wallet balance to observe simulation or send failures.
- Use a congested network/provider to observe confirmation retry behavior.

## What This Demonstrates

- RPC downtime handling
- Retry attempt logging
- Successful recovery through a healthy endpoint
- Blockhash-aware rebuild behavior in the retry pipeline
