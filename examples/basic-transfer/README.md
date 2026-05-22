# Basic Transfer

The smallest useful Sendra example: load a wallet, send a small devnet SOL transfer, stream logs, and let Sendra handle routing, simulation, fee optimization, confirmation, and retries.

## Install

```bash
cd examples/basic-transfer
cp .env.example .env
bun install
```

Or with npm:

```bash
npm install
```

## Configure

Edit `.env`:

```env
SENDRA_DEVNET_URL_1=https://api.devnet.solana.com
RECIPIENT_PUBLIC_KEY=<recipient-public-key>
TRANSFER_SOL=0.001
SENDER_KEYPAIR_PATH=/Users/alice/.config/solana/id.json
MAX_RETRIES=3
```

Fund the sender on devnet before running:

```bash
solana airdrop 1 <sender-public-key> --url devnet
```

## Run

```bash
bun run dev
```

The script calls `SendWithReliability()` with `network = "devnet"`. You should see Sendra logs for RPC selection, transaction construction, fee optimization, simulation, signing, broadcast, and confirmation.

## What This Demonstrates

- Beginner-friendly `SendWithReliability()` usage
- Wallet loading from a keypair file or secret-key JSON
- SOL transfer params
- Retry settings
- Execution logs and confirmation flow
