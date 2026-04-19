"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodeSnippetProps {
  code: string;
  language: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export function CodeSnippet({ code, language, filename, showLineNumbers = true }: CodeSnippetProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split("\n");

  return (
    <div className="my-8 w-full overflow-hidden rounded-2xl border border-white/5 bg-transparent shadow-2xl">
      {/* WINDOW HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]/80" />
          </div>
          {filename && (
            <span className="ml-4 font-mono text-[10px] text-zinc-500 tracking-widest uppercase">
              {filename}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md font-mono text-[9px] transition-all duration-200 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-white/5"
        >
          {copied ? (
            <span className="flex items-center gap-1.5 text-green-400">
              <Check className="h-3.5 w-3.5" />
              COPIED
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Copy className="h-3.5 w-3.5" />
              COPY
            </span>
          )}
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex relative items-stretch">
        {/* LINE NUMBERS */}
        {showLineNumbers && (
          <div className="flex flex-col text-right px-4 py-4 border-r border-white/5 select-none min-w-[50px] shrink-0">
            {lines.map((_, i) => (
              <span key={i} className="font-mono text-[12px] leading-6 text-zinc-600 block h-6">
                {i + 1}
              </span>
            ))}
          </div>
        )}

        {/* CODE — Pure Transparent, Proper Word Wrapping */}
        <div className="grow py-4 pl-4 pr-6 overflow-hidden">
          <div className="m-0 bg-transparent p-0 border-0">
            <code className="font-mono text-[13px] leading-6 text-zinc-300 whitespace-pre-wrap break-words block">
              {code}
            </code>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-4 py-2 border-t border-white/[0.03] flex items-center justify-between">
        <span className="font-mono text-[8px] text-zinc-700 tracking-[0.2em] uppercase">
          Transmission Protocol Active
        </span>
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500/50" />
          <span className="font-mono text-[8.5px] text-zinc-700 uppercase tracking-widest">{language}</span>
        </div>
      </div>
    </div>
  );
}
