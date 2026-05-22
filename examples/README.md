# Sendra Examples

Production-grade onboarding examples for the Sendra SDK. Each folder is a small runnable TypeScript project that can be copied into a new app or run from this monorepo.

## Prerequisites

- Node.js 18+ or Bun 1.2+
- A funded Solana wallet for examples that broadcast transactions
- At least one RPC URL for the network you are using

For devnet examples, create a temporary wallet and fund it with the Solana faucet before sending transactions.

## Examples

| Example | Purpose |
| --- | --- |
| [basic-transfer](./basic-transfer) | The smallest reliable SOL transfer using `SendWithReliability`. |
| [mainnet-config](./mainnet-config) | Production-style mainnet configuration with env-based multi-RPC routing. |
| [custom-rpc](./custom-rpc) | Dynamic RPC pool setup with latency selection and failover. |
| [logger-usage](./logger-usage) | Console and file logging, execution traces, retry logs, and explorer links. |
| [failure-recovery](./failure-recovery) | Intentional RPC failure and recovery behavior with retry-oriented logs. |

## Quick Start Pattern

Every example follows the same shape:

```bash
cd examples/basic-transfer
cp .env.example .env
bun install
bun run dev
```

You can use npm instead:

```bash
npm install
npm run dev
```

## Wallet Format

Examples expect `SENDER_SECRET_KEY` as a JSON array of 64 bytes, the same shape produced by Solana CLI keypair files:

```env
SENDER_SECRET_KEY=[12,34,56,...]
```

You can also point to a Solana keypair file:

```env
SENDER_KEYPAIR_PATH=/Users/alice/.config/solana/id.json
```

For safety, `.env.example` files contain placeholders only. Never commit real private keys.

## RPC Configuration

Sendra discovers RPC pools from environment variables:

```env
SENDRA_DEVNET_URL_1=https://api.devnet.solana.com
SENDRA_DEVNET_URL_2=https://your-devnet-provider.example

SENDRA_MAINNET_URL_1=https://your-mainnet-provider.example
SENDRA_MAINNET_URL_2=https://your-second-provider.example
```

At runtime Sendra probes the configured pool, filters unhealthy endpoints, and selects the fastest healthy RPC for the requested network. The examples load `.env` before importing `sendra-tx`, which is important because Sendra reads these variables during module initialization.

## Architecture Notes

The examples intentionally show the infrastructure path, not just the happy path:

- RPC routing happens before transaction construction.
- Transactions are simulated before signing and broadcast.
- Priority fees are calculated from recent cluster fees.
- Confirmation monitoring runs after broadcast.
- Retry attempts rebuild or refresh transactions, re-run simulation, and may switch RPCs.
- Logs can be streamed to your app and persisted to `sendra-logs/`.

## Running All Examples Locally

These examples are meant to be run one at a time because several broadcast real transactions. To type-check the example sources from the monorepo:

```bash
bun run check-types
```
