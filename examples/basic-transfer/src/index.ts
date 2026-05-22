import { config } from "dotenv";
import { readFileSync } from "node:fs";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import type { SendraOptions, SendraParams, Signer } from "sendra-tx";

config();

function readRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function loadKeypair(): Keypair {
  const rawSecret = process.env.SENDER_SECRET_KEY;
  const keypairPath = process.env.SENDER_KEYPAIR_PATH;
  const secretJson = rawSecret ?? (keypairPath ? readFileSync(keypairPath, "utf8") : undefined);

  if (!secretJson) {
    throw new Error("Set SENDER_SECRET_KEY or SENDER_KEYPAIR_PATH in .env");
  }

  const secret = JSON.parse(secretJson) as number[];
  if (!Array.isArray(secret) || secret.length !== 64) {
    throw new Error("Sender secret key must be a Solana keypair JSON array with 64 numbers");
  }

  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

const { SendWithReliability } = await import("sendra-tx");

const sender = loadKeypair();
const recipient = new PublicKey(readRequiredEnv("RECIPIENT_PUBLIC_KEY"));
if (recipient.equals(PublicKey.default)) {
  throw new Error("Set RECIPIENT_PUBLIC_KEY to a real recipient before running this example");
}
const transferSol = Number(process.env.TRANSFER_SOL ?? "0.001");
const maxRetries = Number(process.env.MAX_RETRIES ?? "3");

const signer: Signer = {
  publicKey: sender.publicKey,
  async signTransaction(tx) {
    tx.sign([sender]);
    return tx;
  },
};

const params: SendraParams = {
  type: "params",
  to: recipient,
  amount: Math.round(transferSol * LAMPORTS_PER_SOL),
};

const options: SendraOptions = {
  maxRetries,
  logger(event) {
    const attempt = event.attempt !== undefined ? ` attempt=${event.attempt}` : "";
    const detail = event.message ?? event.rpc ?? "";
    console.log(`[sendra] ${event.step}${attempt} ${detail}`.trim());
  },
};

console.log(`Sender: ${sender.publicKey.toBase58()}`);
console.log(`Recipient: ${recipient.toBase58()}`);
console.log(`Amount: ${transferSol} SOL`);

const result = await SendWithReliability(params, signer, options, "devnet");

console.log("Result:", result);
