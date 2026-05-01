"use client";
import { useEffect, useState } from "react";
import Navbar from "../_components/Navbar";
import UrlListItem from "../_components/UrlListItem";
import { listUrls } from "@/lib/api";
import { ShortenResponse } from "@/lib/types";
import Link from "next/link";

export default function ListPage() {
  const [urls, setUrls] = useState<ShortenResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listUrls()
      .then(setUrls)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(code: string) {
    setUrls((prev) => prev.filter((u) => u.shortCode !== code));
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-paper pt-14 px-6 py-12">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-ink">My Links</h1>
              <p className="text-sm text-muted mt-1">{urls.length} link{urls.length !== 1 ? "s" : ""} in this session</p>
            </div>
            <Link
              href="/"
              className="h-9 px-4 text-sm font-medium bg-ink text-paper rounded-lg hover:bg-accent transition-colors"
            >
              + New link
            </Link>
          </div>

          {/* States */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-white border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && urls.length === 0 && (
            <div className="text-center py-20 space-y-3">
              <p className="text-4xl">✂️</p>
              <p className="text-muted text-sm">No links yet. Go snip something!</p>
              <Link href="/" className="inline-block text-sm text-accent hover:underline">
                Shorten a URL →
              </Link>
            </div>
          )}

          {!loading && urls.length > 0 && (
            <div className="space-y-3 animate-slide-up">
              {urls.map((u) => (
                <UrlListItem key={u.shortCode} item={u} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
