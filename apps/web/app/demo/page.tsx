"use client";

import { useState, useCallback, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { FlowVisualizer, PipelineStep, StepStatus } from "../components/FlowVisualizer";
import { TxTracker } from "../components/TxTracker";
import { LogsPanel, LogEntry, getTimestamp } from "../components/LogsPanel";
import { MetricsCards } from "../components/MetricsCards";
import { ArchitectureDiagram } from "../components/ArchitectureDiagram";

// ─── Types ───────────────────────────────────────────────────────────────────

interface TxResult {
  signature: string;
  status: "success" | "failed";
  attempts: number;
  latencyMs: number;
  slot?: number;
}

// ─── Initial pipeline state ───────────────────────────────────────────────────

const INITIAL_STEPS: PipelineStep[] = [
  { id: "simulate", label: "Simulate", description: "Pre-flight execution check", status: "idle" },
  { id: "optimize", label: "Optimize Fee", description: "Dynamic compute unit pricing", status: "idle" },
  { id: "route", label: "Route RPC", description: "Latency-ranked endpoint pick", status: "idle" },
  { id: "send", label: "Send", description: "Submit to Solana network", status: "idle" },
  { id: "monitor", label: "Monitor", description: "Await confirmation", status: "idle" },
  { id: "retry", label: "Retry", description: "Smart failover if needed", status: "idle" },
];

// ─── Mock pipeline execution ──────────────────────────────────────────────────

async function mockSendTx(
  txBase64: string,
  onStep: (id: string, status: StepStatus, log: Omit<LogEntry, "id">) => void
): Promise<TxResult> {
  const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const shouldRetry = Math.random() < 0.35;

  // Simulate
  onStep("simulate", "running", { type: "info", message: "Initializing simulation against live state...", timestamp: getTimestamp() });
  await delay(900);
  onStep("simulate", "success", { type: "success", message: "Simulation passed — no revert detected", timestamp: getTimestamp(), detail: "0 CUs wasted" });

  // Optimize Fee
  await delay(200);
  onStep("optimize", "running", { type: "info", message: "Computing optimal compute unit price...", timestamp: getTimestamp() });
  await delay(800);
  const savedPct = Math.floor(30 + Math.random() * 20);
  const feeSOL = (0.000025 + Math.random() * 0.00002).toFixed(6);
  onStep("optimize", "success", { type: "success", message: `Fee set: ${feeSOL} SOL (saved ${savedPct}%)`, timestamp: getTimestamp(), detail: `${savedPct}% cheaper` });

  // Route RPC
  await delay(200);
  onStep("route", "running", { type: "info", message: "Probing RPC endpoints for lowest latency...", timestamp: getTimestamp() });
  await delay(700);
  const latency = Math.floor(8 + Math.random() * 18);
  const rpc = ["ny1.helius-rpc.com", "fra1.helius-rpc.com", "sin1.helius-rpc.com"][Math.floor(Math.random() * 3)];
  onStep("route", "success", { type: "success", message: `Routed to ${rpc} (${latency}ms)`, timestamp: getTimestamp(), detail: `${latency}ms` });

  // Send
  await delay(200);
  onStep("send", "running", { type: "info", message: "Submitting signed transaction...", timestamp: getTimestamp() });
  await delay(600);

  if (shouldRetry) {
    onStep("send", "error", { type: "warn", message: "Attempt 1 timed out — switching RPC node", timestamp: getTimestamp() });
    await delay(300);
    onStep("retry", "running", { type: "info", message: "Retry engine: switching to fallback endpoint...", timestamp: getTimestamp() });
    await delay(900);
    onStep("retry", "success", { type: "success", message: "Retry via fallback — transaction accepted", timestamp: getTimestamp(), detail: "attempt 2" });
    await delay(200);
    onStep("send", "success", { type: "success", message: "Transaction resubmitted successfully", timestamp: getTimestamp() });
  } else {
    onStep("send", "success", { type: "success", message: "Transaction accepted by network", timestamp: getTimestamp() });
    onStep("retry", "idle", { type: "debug", message: "Retry engine: not triggered", timestamp: getTimestamp() });
  }

  // Monitor
  await delay(200);
  onStep("monitor", "running", { type: "info", message: "Polling for confirmation...", timestamp: getTimestamp() });
  await delay(1200);
  const slot = 312800000 + Math.floor(Math.random() * 100000);
  onStep("monitor", "success", { type: "success", message: `Confirmed in slot ${slot.toLocaleString()}`, timestamp: getTimestamp(), detail: `slot ${slot.toLocaleString()}` });

  const sig = Array.from({ length: 87 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789"[Math.floor(Math.random() * 58)]
  ).join("");

  const totalMs = 900 + 800 + 700 + 600 + (shouldRetry ? 900 : 0) + 1200 + Math.floor(Math.random() * 200);

  return {
    signature: sig,
    status: "success",
    attempts: shouldRetry ? 2 : 1,
    latencyMs: totalMs,
    slot,
  };
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const LogoIcon = () => (
  <img src="/logo.png" alt="Sendra" width={32} height={32} className="rounded-md object-contain" />
);

const BackArrow = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CopyIcon = () => (
  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
    <rect x="3.5" y="3.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1" />
    <path d="M2 7H1.5a1 1 0 0 1-1-1V1.5a1 1 0 0 1 1-1H6a1 1 0 0 1 1 1V2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

// ─── Demo Page ────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [txInput, setTxInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TxResult | null>(null);
  const [steps, setSteps] = useState<PipelineStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const logCounterRef = useRef(0);

  const pushLog = useCallback((entry: Omit<LogEntry, "id">) => {
    logCounterRef.current += 1;
    setLogs((prev) => [...prev, { ...entry, id: String(logCounterRef.current) }]);
  }, []);

  const updateStep = useCallback((id: string, status: StepStatus, log: Omit<LogEntry, "id">) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
    pushLog(log);
  }, [pushLog]);

  const handleSend = useCallback(async () => {
    const tx = txInput.trim() || "DEMO_BASE64_TX_PAYLOAD_" + Date.now();
    setLoading(true);
    setResult(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "idle" })));
    setLogs([]);

    pushLog({ type: "info", message: "Transaction received by Sendra relay", timestamp: getTimestamp() });

    try {
      const res = await fetch("/api/tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transaction: tx, options: { maxRetries: 3 } }),
      }).catch(() => null);

      let txResult: TxResult;

      if (res && res.ok) {
        const data = await res.json();
        // Real API response — map to our result format
        txResult = {
          signature: data.signature || "unknown",
          status: data.status === "confirmed" || data.status === "finalized" ? "success" : "failed",
          attempts: data.attempts ?? 1,
          latencyMs: data.latencyMs ?? 0,
          slot: data.slot,
        };
        setResult(txResult);
      } else {
        // No real API — run mock simulation
        txResult = await mockSendTx(tx, updateStep);
        setResult(txResult);
      }
    } catch {
      pushLog({ type: "error", message: "Unexpected error — check console", timestamp: getTimestamp() });
    } finally {
      setLoading(false);
    }
  }, [txInput, updateStep, pushLog]);

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result.signature).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  const handleReset = useCallback(() => {
    setResult(null);
    setSteps(INITIAL_STEPS.map((s) => ({ ...s, status: "idle" })));
    setLogs([]);
    setTxInput("");
  }, []);

  const anyRunning = steps.some((s) => s.status === "running");

  return (
    <main
      className="relative min-h-screen text-white"
      style={{ background: "linear-gradient(180deg, #06060a 0%, #080810 30%, #07070c 70%, #060608 100%)" }}
    >
      {/* Page-wide ambient grid */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <svg className="absolute inset-0 w-full h-full opacity-[0.022]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="demogrid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#demogrid)" />
        </svg>
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,1) 0%, transparent 70%)" }}
        />
      </div>

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          backdropFilter: "blur(20px) saturate(1.4)",
          WebkitBackdropFilter: "blur(20px) saturate(1.4)",
          borderBottom: "1px solid rgba(255,255,255,0.045)",
          background: "rgba(7,7,9,0.82)",
        }}
      >
        <nav className="flex items-center gap-4 px-6 py-4 max-w-7xl mx-auto">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-[11px] font-mono text-white/25 hover:text-white/55 transition-colors duration-200"
          >
            <BackArrow />
            Back
          </Link>
          <div
            className="w-px h-4 flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.08)" }}
          />
          <div className="flex items-center gap-2">
            <LogoIcon />
            <span className="font-semibold text-[13px] tracking-wide text-white/85">Sendra</span>
            <span
              className="px-1.5 py-0.5 rounded font-mono text-[8.5px] text-indigo-300/55 tracking-wide"
              style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.18)" }}
            >
              DEMO
            </span>
          </div>
        </nav>
      </header>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 space-y-14">

        {/* ── Page title ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-2">Interactive Demo</div>
            <h1 className="text-3xl md:text-[42px] font-extralight text-white leading-tight tracking-tight mb-3">
              Send a transaction{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(130deg, #c7d2fe 0%, #a5b4fc 40%, #818cf8 100%)" }}
              >
                via Sendra
              </span>
            </h1>
            <p className="text-white/28 text-[14px] max-w-[480px]">
              Paste any base-64 serialized Solana transaction and watch the full pipeline execute in real-time.
            </p>
          </motion.div>
        </div>

        {/* ── Main 2-col layout ── */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Left col: input + result */}
          <div className="space-y-4">

            {/* Send card */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.05 }}
              className="rounded-xl overflow-hidden"
              style={{
                background: "linear-gradient(160deg, #0d0d12 0%, #0a0a0f 100%)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Card header */}
              <div
                className="px-5 py-3.5 border-b flex items-center gap-2"
                style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(255,255,255,0.015)" }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1.5 6l8.5-4.5-3.5 4.5 3.5 4.5L1.5 6Z" stroke="rgba(165,180,252,0.6)" strokeWidth="1.2" strokeLinejoin="round" />
                </svg>
                <span className="font-mono text-[9.5px] text-white/22 uppercase tracking-widest">
                  Transaction Input
                </span>
              </div>

              <div className="p-5 space-y-4">
                {/* Textarea */}
                <div>
                  <label className="block text-[9.5px] font-mono text-white/22 uppercase tracking-widest mb-2">
                    Serialized Transaction (Base64)
                  </label>
                  <textarea
                    id="tx-input"
                    value={txInput}
                    onChange={(e) => setTxInput(e.target.value)}
                    placeholder="Paste base64-encoded transaction here...&#10;&#10;Leave empty to use a demo transaction."
                    rows={5}
                    className="w-full px-3.5 py-3 rounded-lg font-mono text-[11px] resize-none outline-none transition-all duration-200 placeholder:text-white/14"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.65)",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.35)")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
                    disabled={loading}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2.5">
                  <motion.button
                    id="send-tx-btn"
                    onClick={handleSend}
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex-1 py-2.5 rounded-lg font-mono text-[12px] font-semibold tracking-wide overflow-hidden transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: loading
                        ? "rgba(99,102,241,0.12)"
                        : "rgba(255,255,255,0.94)",
                      color: loading ? "rgba(165,180,252,0.8)" : "#13131a",
                      border: loading ? "1px solid rgba(99,102,241,0.25)" : "none",
                    }}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.span
                          className="inline-block w-3 h-3 rounded-full border border-indigo-400/30"
                          style={{ borderTopColor: "rgba(165,180,252,0.8)" }}
                          animate={{ rotate: 360 }}
                          transition={{ duration: 0.75, repeat: Infinity, ease: "linear" }}
                        />
                        Relaying...
                      </span>
                    ) : (
                      "Send via Sendra →"
                    )}
                    {/* Shine sweep */}
                    {!loading && (
                      <div className="absolute top-0 -left-[120%] w-[60%] h-full transform -skew-x-12 bg-gradient-to-r from-transparent via-indigo-100/30 to-transparent hover:left-[150%] transition-all duration-700 ease-in-out" />
                    )}
                  </motion.button>

                  {result && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={handleReset}
                      className="px-3.5 py-2.5 rounded-lg font-mono text-[11px] transition-colors duration-200"
                      style={{
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "rgba(255,255,255,0.28)",
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      Reset
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Result card */}
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background:
                      result.status === "success"
                        ? "linear-gradient(145deg, rgba(52,211,153,0.06) 0%, rgba(0,0,0,0) 60%)"
                        : "linear-gradient(145deg, rgba(248,113,113,0.06) 0%, rgba(0,0,0,0) 60%)",
                    border:
                      result.status === "success"
                        ? "1px solid rgba(52,211,153,0.15)"
                        : "1px solid rgba(248,113,113,0.15)",
                  }}
                >
                  {/* Result header */}
                  <div
                    className="px-5 py-3.5 border-b flex items-center justify-between"
                    style={{
                      borderColor:
                        result.status === "success"
                          ? "rgba(52,211,153,0.1)"
                          : "rgba(248,113,113,0.1)",
                      background: "rgba(255,255,255,0.012)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background: result.status === "success" ? "#34d399" : "#f87171",
                        }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <span className="font-mono text-[9.5px] text-white/22 uppercase tracking-widest">
                        Result
                      </span>
                    </div>
                    <span
                      className="font-mono text-[10px] font-medium"
                      style={{ color: result.status === "success" ? "#34d399" : "#f87171" }}
                    >
                      {result.status === "success" ? "Confirmed" : "Failed"}
                    </span>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Status", value: result.status === "success" ? "Confirmed" : "Failed", accent: result.status === "success" ? "#34d399" : "#f87171" },
                        { label: "Attempts", value: String(result.attempts), accent: "rgba(255,255,255,0.6)" },
                        { label: "Latency", value: `${result.latencyMs}ms`, accent: "rgba(165,180,252,0.8)" },
                        { label: "Slot", value: result.slot ? result.slot.toLocaleString() : "—", accent: "rgba(255,255,255,0.4)" },
                      ].map(({ label, value, accent }) => (
                        <div
                          key={label}
                          className="rounded-lg px-3.5 py-2.5"
                          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
                        >
                          <div className="text-[8.5px] font-mono text-white/20 uppercase tracking-widest mb-0.5">{label}</div>
                          <div className="text-[13px] font-medium" style={{ color: accent }}>{value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Signature */}
                    <div
                      className="rounded-lg px-3.5 py-2.5"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-[8.5px] font-mono text-white/20 uppercase tracking-widest">Signature</div>
                        <motion.button
                          onClick={handleCopy}
                          whileTap={{ scale: 0.94 }}
                          className="flex items-center gap-1 text-[8.5px] font-mono transition-colors duration-200"
                          style={{ color: copied ? "#34d399" : "rgba(255,255,255,0.22)" }}
                        >
                          <CopyIcon />
                          {copied ? "Copied!" : "Copy"}
                        </motion.button>
                      </div>
                      <div className="font-mono text-[9.5px] text-white/32 break-all leading-relaxed">
                        {result.signature}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tx Tracker */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.12 }}
            >
              <TxTracker />
            </motion.div>
          </div>

          {/* Right col: pipeline + logs */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.08 }}
            >
              <FlowVisualizer steps={steps} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.12 }}
              className="h-72"
            >
              <LogsPanel logs={logs} onClear={() => setLogs([])} />
            </motion.div>
          </div>
        </div>

        {/* ── Metrics ── */}
        <section>
          <div className="mb-6">
            <div className="text-[10px] font-mono text-white/18 uppercase tracking-[0.2em] mb-1.5">Performance</div>
            <h2 className="text-xl font-light text-white">Relay metrics</h2>
          </div>
          <MetricsCards
            compact
            liveLatency={result?.latencyMs ?? null}
            liveRetries={result?.attempts ?? null}
          />
        </section>

        {/* ── How it works ── */}
        <section>
          <div
            className="h-px mb-10"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
          />
          <div className="mb-8">
            <div className="text-[10px] font-mono text-white/18 uppercase tracking-[0.2em] mb-1.5">Pipeline</div>
            <h2 className="text-xl font-light text-white">How it works</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { n: "01", label: "Receive", desc: "Transaction arrives at Sendra API in base64 format via REST or SDK." },
              { n: "02", label: "Simulate", desc: "Pre-flight execution against current chain state — catches reverts before they cost fees." },
              { n: "03", label: "Optimize Fee", desc: "Priority fee tuned dynamically to network congestion — no overpaying, no drops." },
              { n: "04", label: "Route RPC", desc: "Global latency scan picks the fastest available RPC node every single time." },
              { n: "05", label: "Send & Monitor", desc: "Submitted with full context. Sendra polls for confirmation until landed or timed out." },
              { n: "06", label: "Retry", desc: "Exponential backoff with intelligent node switching if a transaction stalls or times out." },
            ].map(({ n, label, desc }, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="relative rounded-xl p-5 cursor-default"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div className="text-[8.5px] font-mono text-white/18 mb-3 tracking-widest">{n}</div>
                <div className="text-[13px] font-medium text-white/80 mb-1.5">{label}</div>
                <div className="text-[11.5px] text-white/32 leading-relaxed">{desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Architecture Diagram ── */}
        <section>
          <div
            className="h-px mb-10"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
          />
          <div className="mb-8">
            <div className="text-[10px] font-mono text-white/18 uppercase tracking-[0.2em] mb-1.5">Architecture</div>
            <h2 className="text-xl font-light text-white">System overview</h2>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="rounded-xl p-6 overflow-x-auto"
            style={{
              background: "linear-gradient(160deg, #0c0c10 0%, #09090d 100%)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <ArchitectureDiagram />
          </motion.div>
        </section>

        {/* ── CTA ── */}
        <section className="text-center py-8">
          <div
            className="h-px mb-10"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)" }}
          />
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="space-y-5"
          >
            <div className="text-[10px] font-mono text-white/18 uppercase tracking-[0.2em]">Ready?</div>
            <h2 className="text-3xl md:text-[38px] font-extralight text-white leading-tight tracking-tight">
              Stop losing transactions.
            </h2>
            <p className="text-white/28 text-[14px]">Integrate in minutes — drop-in SDK, zero infrastructure changes.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg font-mono text-[12px] font-medium transition-all duration-200 hover:opacity-80"
                style={{
                  background: "rgba(255,255,255,0.92)",
                  color: "#13131a",
                }}
              >
                View GitHub →
              </a>
              <Link
                href="/"
                className="px-5 py-2.5 rounded-lg font-mono text-[12px] transition-colors duration-200"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.32)",
                }}
              >
                Back to landing
              </Link>
            </div>
          </motion.div>
        </section>

      </div>

      {/* Footer */}
      <footer
        className="relative z-10 border-t mt-6"
        style={{ borderColor: "rgba(255,255,255,0.04)" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <span className="font-mono text-[9px] text-white/14">sendra relay engine · hackathon demo</span>
          <span className="font-mono text-[9px] text-white/14">built for Solana builders</span>
        </div>
      </footer>
    </main>
  );
}
