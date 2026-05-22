# Mainnet Configuration

Production-style configuration for running Sendra on Solana mainnet with multiple RPC providers.

This example is intentionally guarded by `CONFIRM_MAINNET_SEND=false` so you can validate configuration without accidentally broadcasting a real mainnet transaction.

## Install

```bash
cd examples/mainnet-config
cp .env.example .env
bun install
```

## Configure RPC Providers

Add your production RPC providers:

```env
SENDRA_MAINNET_URL_1=https://mainnet.helius-rpc.com/?api-key=<helius-key>
SENDRA_MAINNET_URL_2=https://<subdomain>.quiknode.pro/<token>
SENDRA_MAINNET_URL_3=https://your-private-rpc.example
```

Sendra will probe the pool, filter unhealthy endpoints, and select the fastest healthy endpoint for the transaction.

## Configure Safety Settings

Keep this false for config validation:

```env
CONFIRM_MAINNET_SEND=false
```

Set it only when you intentionally want to send:

```env
CONFIRM_MAINNET_SEND=true
```

Use a dedicated low-balance wallet while testing production settings.

## Run

```bash
bun run dev
```

When `CONFIRM_MAINNET_SEND=false`, the script prints the resolved production settings and exits before broadcasting. When true, it calls `SendWithReliability()` on mainnet.

## What This Demonstrates

- `SENDRA_MAINNET_URL_*` configuration
- Multiple provider routing
- Secure env-driven setup
- Production retry count defaults
- Mainnet safety gates
