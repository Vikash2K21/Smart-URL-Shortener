"use client";
import { useState } from "react";
import { shortenUrl } from "@/lib/api";
import { ShortenResponse } from "@/lib/types";
import ResultCard from "./ResultCard";

export default function ShortenForm() {
  const [url, setUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ShortenResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const data = await shortenUrl(url.trim(), customCode.trim() || undefined);
      setResult(data);
      setUrl("");
      setCustomCode("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main URL input */}
        <div className="relative">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a long URL here..."
            className="w-full h-14 px-4 pr-36 bg-white border border-border rounded-xl text-ink font-body text-sm placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
            required
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="absolute right-2 top-2 h-10 px-5 bg-ink text-paper text-sm font-medium rounded-lg disabled:opacity-40 hover:bg-accent transition-colors duration-200"
          >
            {loading ? "Snipping…" : "Snip it →"}
          </button>
        </div>

        {/* Custom code toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowCustom((v) => !v)}
            className="text-xs text-muted hover:text-ink transition-colors"
          >
            {showCustom ? "− Hide" : "+ Add"} custom short code
          </button>
          {showCustom && (
            <div className="mt-2 flex items-center gap-2 animate-fade-in">
              <span className="text-xs text-muted font-mono">localhost:3000/</span>
              <input
                type="text"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="my-link"
                maxLength={20}
                className="flex-1 h-9 px-3 bg-white border border-border rounded-lg text-ink text-sm font-mono placeholder:text-muted focus:outline-none focus:border-ink transition-colors"
              />
            </div>
          )}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl animate-slide-up">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-4 animate-slide-up">
          <ResultCard result={result} />
        </div>
      )}
    </div>
  );
}
