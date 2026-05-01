"use client";
import { useState } from "react";
import { ShortenResponse } from "@/lib/types";
import { deleteUrl } from "@/lib/api";

interface Props {
  item: ShortenResponse;
  onDelete: (code: string) => void;
}

export default function UrlListItem({ item, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function copy() {
    navigator.clipboard.writeText(item.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete() {
    if (!confirm("Delete this link?")) return;
    setDeleting(true);
    try {
      await deleteUrl(item.shortCode);
      onDelete(item.shortCode);
    } catch {
      alert("Failed to delete. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="p-4 bg-white border border-border rounded-xl space-y-2 hover:border-ink/20 transition-colors">
      {/* Short URL row */}
      <div className="flex items-center justify-between gap-2">
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-accent font-medium truncate hover:underline"
        >
          {item.shortUrl}
        </a>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted bg-paper px-2 py-0.5 rounded-full">
            {item.clickCount} {item.clickCount === 1 ? "click" : "clicks"}
          </span>
          <button
            onClick={copy}
            className="h-7 px-2.5 text-xs border border-border rounded-lg hover:border-ink transition-colors"
          >
            {copied ? "✓" : "Copy"}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="h-7 px-2.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40"
          >
            {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>

      {/* Original URL */}
      <p className="text-xs text-muted truncate">→ {item.originalUrl}</p>

      {/* Date */}
      <p className="text-xs text-muted/60">
        {new Date(item.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        })}
      </p>
    </div>
  );
}
