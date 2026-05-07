"use client";
import { useState } from "react";
import { ShortenResponse } from "@/lib/types";
import { deleteUrl } from "@/lib/api";

const BACKEND = "https://smart-url-shortener-a29p.onrender.com";

interface Props {
  item: ShortenResponse;
  onDelete: (code: string) => void;
}

export default function UrlListItem({ item, onDelete }: Props) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const qrUrl = `${BACKEND}/api/qr/${item.shortCode}`;

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
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 14,
      padding: "16px 20px",
      transition: "border-color .2s, background .2s",
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--border-hover)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
    >
      {/* Top row — short URL + actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <a
          href={item.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, fontFamily: "DM Mono, monospace", fontSize: 14,
            fontWeight: 500, color: "var(--lime)", textDecoration: "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
        >
          {item.shortUrl}
        </a>

        {/* Click count badge */}
        <span style={{
          fontSize: 11, color: "var(--text-2)",
          background: "var(--surface-2)", border: "1px solid var(--border)",
          padding: "3px 8px", borderRadius: 999,
          fontFamily: "DM Mono, monospace", whiteSpace: "nowrap", flexShrink: 0,
        }}>
          {item.clickCount} {item.clickCount === 1 ? "click" : "clicks"}
        </span>

        {/* Copy */}
        <button onClick={copy} style={{
          height: 30, padding: "0 10px", fontSize: 12,
          border: "1px solid var(--border)", borderRadius: 7,
          background: "transparent", color: "var(--text-2)",
          cursor: "pointer", transition: "all .2s", flexShrink: 0,
        }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--border-hover)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          {copied ? "✓" : "Copy"}
        </button>

        {/* QR toggle */}
        <button
          onClick={() => setShowQR(v => !v)}
          title="QR Code"
          style={{
            width: 30, height: 30, borderRadius: 7, flexShrink: 0,
            border: "1px solid var(--border)",
            background: showQR ? "var(--surface-2)" : "transparent",
            color: "var(--text-2)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--border-hover)";
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.color = "var(--text-2)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17v3M17 14h3"/>
          </svg>
        </button>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            height: 30, padding: "0 10px", fontSize: 12, flexShrink: 0,
            border: "1px solid rgba(255,77,109,.2)",
            color: "rgba(255,77,109,.7)", borderRadius: 7,
            background: "transparent", cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? .4 : 1, transition: "all .2s",
          }}
          onMouseEnter={e => {
            if (!deleting) {
              e.currentTarget.style.background = "rgba(255,77,109,.08)";
              e.currentTarget.style.borderColor = "rgba(255,77,109,.4)";
              e.currentTarget.style.color = "var(--red)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(255,77,109,.2)";
            e.currentTarget.style.color = "rgba(255,77,109,.7)";
          }}
        >
          {deleting ? "…" : "Delete"}
        </button>
      </div>

      {/* Original URL */}
      <p style={{ fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>
        → {item.originalUrl}
      </p>

      {/* Date */}
      <p style={{ fontSize: 11, color: "var(--text-3)" }}>
        {new Date(item.createdAt).toLocaleDateString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })}
      </p>

      {/* QR Code section */}
      {showQR && (
        <div style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          {/* QR image — white background always for readability */}
          <div style={{
            padding: 8, background: "#ffffff",
            borderRadius: 10, border: "1px solid var(--border)",
            flexShrink: 0,
          }}>
            <img
              src={qrUrl}
              alt={`QR code for ${item.shortUrl}`}
              width={100}
              height={100}
              style={{ display: "block" }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 8 }}>
              Scan to visit:
            </p>
            <p style={{ fontSize: 11, fontFamily: "DM Mono, monospace", color: "var(--lime)", marginBottom: 12 }}>
              {item.shortUrl}
            </p>
            {/* Download */}
            <a
              href={qrUrl}
              download={`snip-qr-${item.shortCode}.png`}
              style={{
                fontSize: 12, color: "var(--text-2)", textDecoration: "none",
                display: "inline-flex", alignItems: "center", gap: 6,
                border: "1px solid var(--border)", padding: "5px 12px",
                borderRadius: 7, transition: "all .2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--border-hover)";
                e.currentTarget.style.color = "var(--text)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-2)";
              }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download PNG
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
