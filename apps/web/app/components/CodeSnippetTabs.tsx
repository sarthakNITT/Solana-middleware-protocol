"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.1" />
    <path d="M3 10H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2.5 7.5l3 3 6-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type TabKey = "Go" | "typescript" | "python" | "rust";

interface Tab {
  key: TabKey;
  label: string;
  lang: string;
  dot: string;
  code: string;
}

const TABS: Tab[] = [
  {
    key: "rust",
    label: "Rust",
    lang: "rust",
    dot: "#dea584",
    code: `use sendra_sdk::{SendWithReliability, SendraParams, SendraOptions, Signer as SendraSigner};
use solana_sdk::{signature::{Keypair, Signer}, pubkey::Pubkey};
use solana_transaction::versioned::VersionedTransaction;

#[tokio::main]
async fn main() {
    let keypair = Keypair::new();
    let params = SendraParams {
        from: keypair.pubkey(),
        to: "DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa"
            .parse::<Pubkey>()
            .unwrap(),
        amount: 1000,
    };
    let signer = SendraSigner {
        public_key: keypair.pubkey(),
        sign_transaction: move |mut tx: VersionedTransaction| -> VersionedTransaction {
            tx.sign(&[&keypair]);
            tx
        },
    };
    let options = SendraOptions {
        max_retries: 3,
    };
    SendWithReliability(params, signer, options).await;
};`,
  },
  {
    key: "typescript",
    label: "TypeScript",
    lang: "typescript",
    dot: "#3178c6",
    code: `import { SendWithReliability } from "@sendra/sdk";
import { Keypair } from "@solana/web3.js";

const signer = Keypair.generate();

await SendWithReliability(
  {
    from: signer.publicKey,
    to: "DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa",
    amount: 1000,
  },
  {
    publicKey: signer.publicKey,
    signTransaction: async (tx) => {
      tx.sign([signer]);
      return tx;
    },
  },
  { maxRetries: 3 }
);`,
  },
  {
    key: "python",
    label: "Python",
    lang: "python",
    dot: "#3572A5",
    code: `from sendra_sdk import SendWithReliability, SendraParams, SendraOptions, Signer
from solders.keypair import Keypair
from solders.pubkey import Pubkey
from solders.transaction import VersionedTransaction

keypair = Keypair()

params = SendraParams(
    from_=keypair.pubkey(),
    to=Pubkey.from_string("DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa"),
    amount=1000
)
def sign_transaction(tx: VersionedTransaction) -> VersionedTransaction:
    tx = VersionedTransaction(tx.message, [keypair])
    return tx
signer = Signer(
    public_key=keypair.pubkey(),
    sign_transaction=sign_transaction
)
options = SendraOptions(max_retries=3)
SendWithReliability(params, signer, options)`,
  },
  {
    key: "Go",
    label: "Go",
    lang: "go",
    dot: "#89e051",
    code: `package main
import (
	sendra "github.com/sendra/sdk"
	"github.com/gagliardetto/solana-go"
)

func main() {
	keypair := solana.NewWallet()
	params := sendra.SendraParams{
		From:   keypair.PublicKey(),
		To:     solana.MustPublicKeyFromBase58("DrxQyFuqPdnyetjQuZhWiVyQiNhdnbPybPynpdkn1mQa"),
		Amount: 1000,
	}
	signer := sendra.Signer{
		PublicKey: keypair.PublicKey(),
		SignTransaction: func(tx *solana.VersionedTransaction) *solana.VersionedTransaction {
        _ = tx.Sign(func(solana.PublicKey) *solana.PrivateKey {
          return &keypair.PrivateKey
        })
        return tx
    },
	}
	options := sendra.SendraOptions{
		MaxRetries: 3,
	}
	sendra.SendWithReliability(params, signer, options)
}`,
  },
];

const customTheme = {
  ...atomOneDark,
  hljs: {
    ...atomOneDark.hljs,
    background: "transparent",
    color: "#c9d1d9",
    fontSize: "12.5px",
    lineHeight: "1.75",
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
  },
};

export function CodeSnippetTabs() {
  const [active, setActive] = useState<TabKey>("rust");
  const [copied, setCopied] = useState(false);

  const activeTab = TABS.find((t) => t.key === active)!;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(activeTab.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [activeTab.code]);

  return (
    <div className="relative w-full">
      <div
        className="absolute inset-0 rounded-2xl -z-10 pointer-events-none"
        style={{ boxShadow: "0 0 80px rgba(99,102,241,0.05), 0 32px 64px rgba(0,0,0,0.5)" }}
      />

      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: "#0d0d0f",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        {/* TOP BAR */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.05]"
          style={{ background: "#111113" }}
        >
          {/* Logo Title */}
          <div className="flex items-center gap-2 mr-4 text-white">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span className="font-semibold text-[13px] tracking-wide">Sendra</span>
          </div>

          {/* TABS (Pills) */}
          <div className="flex items-center gap-2">
            {TABS.map((tab) => {
              const isActive = active === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActive(tab.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-all duration-200 outline-none"
                  style={{
                    backgroundColor: isActive ? "#ffb870" : "rgba(255,255,255,0.06)",
                    color: isActive ? "#000000" : "rgba(255,255,255,0.7)",
                    border: isActive ? "1px solid #ffb870" : "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN TWO PANELS */}
        <div className="flex flex-col md:flex-row relative">

          {/* LEFT CODE PANEL */}
          <div className="relative w-full md:w-[60%] border-r border-white/[0.04] p-2 bg-[#0c0c0e]">
            {/* Copy Button placed floating on top right of the code area */}
            <motion.button
              onClick={handleCopy}
              whileTap={{ scale: 0.95 }}
              className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.06)",
                color: copied ? "#4ade80" : "rgba(255,255,255,0.6)",
                border: "1px solid rgba(255,255,255,0.04)"
              }}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? "Copied" : "Copy Code"}
            </motion.button>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="h-[550px] overflow-hidden"
              >
                <SyntaxHighlighter
                  language={activeTab.lang}
                  style={customTheme}
                  showLineNumbers={false}
                  className="[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  customStyle={{
                    margin: 0,
                    padding: "24px",
                    background: "transparent",
                    overflow: "auto",
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Menlo', monospace",
                      fontSize: "13px"
                    },
                  }}
                >
                  {activeTab.code}
                </SyntaxHighlighter>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* RIGHT COMMENTS PANEL */}
          <div className="w-full md:w-[40%] p-8 bg-[#0e0e11] font-mono text-[12px] leading-relaxed h-[550px] overflow-hidden">
            <div style={{ color: "rgba(255,255,255,0.4)" }}>
              # Sendra
              <br />
              <br />
              # Sendra API logic intercepts your transactions before they hit the network to retrieve relevant context from multiple apps.
              <br />
              <br />
              # Installation
              <br />
              <br />
              # To install Sendra SDK, run:
              <br />
              <br />
              # pip install sendra-sdk
              <br />
              # npm install @sendra/sdk
              <br />
              <br />
              <span className="text-[#a5b4fc] block mt-2">→ Read more on docs.sendra.dev</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
