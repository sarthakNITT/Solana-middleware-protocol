import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sendra — Transactions that don't fail.",
  description: "Sendra ensures every Solana transaction lands — with simulation, smart routing, and automatic retries.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
