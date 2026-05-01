"use client";
import { useState } from "react";
import { ShortenResponse } from "@/lib/types";

export default function ResultCard({ result }: { result: ShortenResponse }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-5 bg-white border border-border rounded-xl space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted uppercase tracking-widest">Your short link</span>
        <span className="text-xs text-muted">{result.clickCount} clicks</span>
      </div>

      <div className="flex items-center gap-2">
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 font-mono text-sm text-accent font-medium truncate hover:underline"
        >
          {result.shortUrl}
        </a>
        <button
          onClick={copy}
          className="shrink-0 h-8 px-3 text-xs font-medium border border-border rounded-lg hover:border-ink hover:bg-ink hover:text-paper transition-all"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <p className="text-xs text-muted truncate">→ {result.originalUrl}</p>
    </div>
  );
}
