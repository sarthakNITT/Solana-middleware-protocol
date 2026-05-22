# Custom RPC Pool

Demonstrates dynamic RPC pool usage with Helius-style, QuickNode-style, and fallback Solana RPC URLs.

## Install

```bash
cd examples/custom-rpc
cp .env.example .env
bun install
```

## Configure

```env
SENDRA_DEVNET_URL_1=https://devnet.helius-rpc.com/?api-key=<helius-key>
SENDRA_DEVNET_URL_2=https://<subdomain>.quiknode.pro/<token>
SENDRA_DEVNET_URL_3=https://api.devnet.solana.com
```

Sendra measures endpoint health and latency before selecting the RPC used for the transaction. If an endpoint is down, it is filtered out of the candidate pool.

## Run

```bash
bun run dev
```

Watch for `RPC_SELECTED` logs. If you intentionally break one URL, Sendra should route around it and select a healthy endpoint.

## What This Demonstrates

- Custom RPC pools through env variables
- Latency-based selection
- Unhealthy RPC filtering
- Provider-agnostic setup
- Failover-friendly transaction execution
