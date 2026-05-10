Sendra is distributed as a modular package via NPM. This page details the installation process, peer dependencies, and environment requirements for running the Sendra reliability layer in production.

## Package Installation

The core SDK is published under the `sendra-tx` namespace. You should also ensure you have the required Solana peer dependencies installed in your project.
```bash
[multi]
pnpm add sendra-tx @solana/web3.js
npm install sendra-tx @solana/web3.js
yarn add sendra-tx @solana/web3.js
bun add sendra-tx @solana/web3.js
```

## Peer Dependencies

Sendra is designed to be highly compatible with the existing Solana ecosystem. It relies on the following peer dependencies:

- **@solana/web3.js**
  The SDK uses versioned transactions (`v0`) and requires a relatively modern version of the core library (>= 1.9.0).

- **TypeScript**
  While not strictly required, Sendra is built in TypeScript and providing full type safety is a core feature of the library. We recommend TS version 4.5+.

## System Requirements

### Runtime Environment
Sendra is compatible with most modern JavaScript runtimes:
- **Node.js**: 18.x, 20.x, or 22.x.
- **Web Browsers**: Any modern browser (Chrome, Firefox, Safari) that supports ES Modules and the Web Crypto API.
- **Edge Functions**: Compatible with Cloudflare Workers and Vercel Edge Runtime.

### Network Access
To function correctly, the environment running Sendra must have outbound HTTPS and WebSocket access to your chosen Solana RPC providers. This is necessary for the **Dynamic Router** to fetch slot heights and the **Retry Engine** to monitor transaction signatures in real-time.

## Configuration Best Practices

We recommend configuring Sendra via environment variables to ensure that your RPC URLs and API keys are not hardcoded into your application logic.

```env
# Essential configuration
SOLANA_MAINNET_RPC=https://...
SOLANA_BACKUP_RPC=https://...

# Optional Performance Tuning
SENDRA_MAX_RETRIES=10
SENDRA_DEFAULT_COMMITMENT=confirmed
```

## Professional Integration Tip

If you are running Sendra in a server-side environment (Node.js), we recommend using an HTTP agent with connection pooling (like `undici`) for your RPC connections. This reduces the latency of the initial `POST` requests during the benchmark and simulation phases of the Sendra lifecycle.
