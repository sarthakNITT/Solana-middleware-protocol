"use client";

import { Divider } from "@repo/utils";
import { motion } from "framer-motion";

function ArchNode({ label, cx, cy, w = 140, accent = false }: { label: string; cx: number; cy: number; w?: number; accent?: boolean }) {
    const x = cx - w / 2;
    const y = cy - 20;
    return (
        <g>
            <rect
                x={x} y={y} width={w} height={40} rx={10}
                fill={accent ? "rgba(232,115,74,0.08)" : "rgba(20,20,25,0.65)"}
                stroke={accent ? "rgba(232,115,74,0.5)" : "rgba(255,255,255,0.12)"}
                strokeWidth={1}
                style={{ backdropFilter: "blur(4px)" }}
            />
            <text
                x={cx} y={cy + 4}
                textAnchor="middle"
                fill={accent ? "#E8734A" : "rgba(255,255,255,0.75)"}
                fontSize={12}
                fontFamily="monospace"
                fontWeight={accent ? 600 : 400}
                letterSpacing={0.5}
            >
                {label}
            </text>
        </g>
    );
}

function ConnLine({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
    const midY = y1 + (y2 - y1) / 2;
    return (
        <path
            d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
        />
    );
}

function ArchitectureDiagram() {
    return (
        <svg viewBox="0 0 800 380" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%", padding: "10px 0" }}>
            <ConnLine x1={400} y1={40} x2={400} y2={65} />
            <ConnLine x1={400} y1={105} x2={200} y2={130} />
            <ConnLine x1={400} y1={105} x2={400} y2={130} />
            <ConnLine x1={400} y1={105} x2={600} y2={130} />
            <ConnLine x1={200} y1={170} x2={145} y2={195} />
            <ConnLine x1={200} y1={170} x2={315} y2={195} />
            <ConnLine x1={400} y1={170} x2={485} y2={195} />
            <ConnLine x1={600} y1={170} x2={655} y2={195} />
            <ConnLine x1={145} y1={235} x2={280} y2={260} />
            <ConnLine x1={315} y1={235} x2={280} y2={260} />
            <ConnLine x1={485} y1={235} x2={520} y2={260} />
            <ConnLine x1={655} y1={235} x2={520} y2={260} />
            <ConnLine x1={280} y1={300} x2={400} y2={325} />
            <ConnLine x1={520} y1={300} x2={400} y2={325} />

            <ArchNode label="@repo/sdk" cx={400} cy={20} w={130} accent />
            <ArchNode label="@repo/core" cx={400} cy={85} w={130} accent />

            <ArchNode label="@repo/logger" cx={200} cy={150} w={130} />
            <ArchNode label="@repo/fee-optimizer" cx={400} cy={150} w={165} />
            <ArchNode label="@repo/retry-engine" cx={600} cy={150} w={155} />

            <ArchNode label="@repo/simulator" cx={145} cy={215} w={140} />
            <ArchNode label="@repo/router" cx={315} cy={215} w={130} />
            <ArchNode label="@repo/tx-builder" cx={485} cy={215} w={145} />
            <ArchNode label="@repo/rpc-client" cx={655} cy={215} w={140} />

            <ArchNode label="@repo/types" cx={280} cy={280} w={130} />
            <ArchNode label="@repo/config" cx={520} cy={280} w={130} />

            <ArchNode label="@solana/web3.js" cx={400} cy={345} w={160} accent />

            <circle cx={400} cy={200} r={220} fill="url(#glow)" opacity={0.12} />
            <defs>
                <radialGradient id="glow">
                    <stop offset="0%" stopColor="#E8734A" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
        </svg>
    );
}

function PulsingDot() {
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: "#4ade80", display: "inline-block",
                }}
            />
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(74,222,128,0.8)" }}>LIVE</span>
        </span>
    );
}

function FeatureCard({ title, desc, icon, delay = 0 }: { title: string; desc: string; icon: React.ReactNode; delay?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            style={{
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 16,
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div className="absolute inset-0">
                <img
                    src="/hero_bg.jpg"
                    alt=""
                    className="w-full h-full object-cover"
                    style={{ filter: "blur(30px) brightness(0.5) saturate(0.7)" }}
                />
                <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
            </div>
            <div style={{ position: "relative", zIndex: 1, padding: "32px 28px", display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.03)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    {icon}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", margin: 0 }}>{title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.4)", margin: 0 }}>{desc}</p>
            </div>
        </motion.div>
    );
}

const icons = {
    bolt: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8734A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
    ),
    shield: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8734A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
    ),
    code: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8734A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
        </svg>
    ),
};

export default function Features() {
    return (
        <>
            <section id="features" className="relative z-10">
                <Divider />
                <div style={{ maxWidth: 1280, margin: "0 auto", padding: "96px 24px" }}>
                    <div style={{ marginBottom: 56 }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.2)",
                            textTransform: "uppercase", letterSpacing: "0.2em",
                            border: "1px solid rgba(255,255,255,0.06)",
                            padding: "6px 12px", borderRadius: 9999, marginBottom: 16,
                        }}>
                            Features
                        </div>
                        <h2 style={{ fontSize: 40, fontWeight: 300, color: "#fff", lineHeight: 1.15, margin: 0 }}>
                            Infrastructure built for<br />reliable execution
                        </h2>
                        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.35)", marginTop: 16, maxWidth: 560, lineHeight: 1.7 }}>
                            Sendra&apos;s modular architecture gives you full control over every stage of the transaction lifecycle — from simulation to confirmation.
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20, marginBottom: 20 }} className="lg:!grid-cols-[2fr_1fr]">

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            style={{
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16,
                                overflow: "hidden",
                                position: "relative",
                            }}
                        >
                            <div className="absolute inset-0">
                                <img
                                    src="/hero_bg.jpg"
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{ filter: "blur(30px) brightness(0.5) saturate(0.7)" }}
                                />
                                <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
                            </div>
                            <div style={{ padding: "28px 28px 0", position: "relative", zIndex: 1 }}>
                                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>
                                    Modular Architecture
                                </h3>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, maxWidth: 460, lineHeight: 1.7 }}>
                                    Every component is a separate package — swap, extend, or replace any layer without touching the rest. Built as a true monorepo with clean dependency boundaries.
                                </p>
                            </div>
                            <div style={{ padding: "20px 16px 0", position: "relative", zIndex: 1 }}>
                                <ArchitectureDiagram />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            style={{
                                border: "1px solid rgba(255,255,255,0.07)",
                                borderRadius: 16,
                                overflow: "hidden",
                                position: "relative",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            <div className="absolute inset-0">
                                <img
                                    src="/hero_bg.jpg"
                                    alt=""
                                    className="w-full h-full object-cover"
                                    style={{ filter: "blur(30px) brightness(0.5) saturate(0.7)" }}
                                />
                                <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.25)" }} />
                            </div>

                            <div style={{ position: "relative", zIndex: 1, padding: "28px 28px 0", flex: "0 0 auto" }}>
                                <div style={{ marginBottom: 16 }}>
                                    <PulsingDot />
                                </div>
                                <h3 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>
                                    Real-time Data Sync
                                </h3>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.7 }}>
                                    Every transaction streams status updates in real-time. No stale snapshots. No manual refreshing.
                                </p>
                            </div>

                            <div style={{
                                position: "relative", zIndex: 1, flex: 1,
                                padding: "24px 28px 28px",
                                display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 6,
                            }}>
                                {[
                                    { status: "confirmed", sig: "5Kx9...mR3q", time: "1.2s" },
                                    { status: "simulated", sig: "8Tn2...vB7k", time: "0.4s" },
                                    { status: "optimized", sig: "3Wp5...nL1m", time: "0.8s" },
                                    { status: "confirmed", sig: "9Ry4...jP2a", time: "1.1s" },
                                    { status: "retried", sig: "2Dm8...cQ5f", time: "2.3s" },
                                ].map((log, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                                        style={{
                                            display: "flex", alignItems: "center", gap: 10,
                                            fontSize: 11, fontFamily: "monospace",
                                            padding: "6px 10px", borderRadius: 6,
                                            background: "rgba(255,255,255,0.03)",
                                            border: "1px solid rgba(255,255,255,0.05)",
                                        }}
                                    >
                                        <span style={{
                                            width: 6, height: 6, borderRadius: "50%",
                                            background: log.status === "confirmed" ? "#4ade80"
                                                : log.status === "retried" ? "#facc15"
                                                    : "rgba(255,255,255,0.3)",
                                        }} />
                                        <span style={{ color: "rgba(255,255,255,0.5)" }}>{log.sig}</span>
                                        <span style={{
                                            color: log.status === "confirmed" ? "rgba(74,222,128,0.7)"
                                                : log.status === "retried" ? "rgba(250,204,21,0.7)"
                                                    : "rgba(255,255,255,0.3)",
                                            textTransform: "uppercase", fontSize: 9, letterSpacing: "0.05em",
                                        }}>
                                            {log.status}
                                        </span>
                                        <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.2)" }}>{log.time}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }} className="md:!grid-cols-3">
                        <FeatureCard
                            title="Smart Fee Optimization"
                            desc="Dynamically adjusts priority fees based on real-time network congestion. Never overpay, never get dropped."
                            icon={icons.bolt}
                            delay={0}
                        />
                        <FeatureCard
                            title="Simulation Before Send"
                            desc="Every transaction is simulated before submission. Catch failures before they cost you compute units and time."
                            icon={icons.shield}
                            delay={0.1}
                        />
                        <FeatureCard
                            title="Drop-in SDK"
                            desc="Three lines of code to integrate. Works with any Solana project — no infrastructure changes, no vendor lock-in."
                            icon={icons.code}
                            delay={0.2}
                        />
                    </div>
                </div>
            </section>
        </>
    );
}
