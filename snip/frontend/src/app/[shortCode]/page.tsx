"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { resolveUrl } from "@/lib/api";

export default function RedirectPage() {
  const params = useParams();
  const shortCode = params.shortCode as string;
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shortCode) return;
    resolveUrl(shortCode)
      .then((data) => {
        window.location.replace(data.originalUrl);
      })
      .catch((e) => {
        setError(e.message || "This short link does not exist.");
      });
  }, [shortCode]);

  if (error) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center space-y-4">
          <p className="text-6xl">🔍</p>
          <h1 className="font-display text-2xl font-bold text-ink">Link not found</h1>
          <p className="text-muted text-sm">
            The short code <span className="font-mono text-ink">/{shortCode}</span> doesn&apos;t exist
            or may have been deleted.
          </p>
          <a
            href="/"
            className="inline-block h-10 px-6 bg-ink text-paper text-sm font-medium rounded-lg hover:bg-accent transition-colors leading-10"
          >
            ← Go home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-ink border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted">Redirecting you…</p>
      </div>
    </div>
  );
}
