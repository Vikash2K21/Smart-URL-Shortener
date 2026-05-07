"use client";
import { useState } from "react";
import { ShortenResponse } from "@/lib/types";

const BACKEND = "https://smart-url-shortener-a29p.onrender.com";

export default function ResultCard({ result }: { result: ShortenResponse }) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  function copy() {
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // QR code image URL — calls GET /api/qr/{shortCode}
  const qrUrl = `${BACKEND}/api/qr/${result.shortCode}`;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(200,255,0,0.06) 0%, var(--surface) 100%)",
        border: "1px solid rgba(200,255,0,0.2)",
        borderRadius: 16,
        padding: "20px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow accent */}
      <div style={{
        position: "absolute", top: -40, right: -40,
        width: 120, height: 120,
        background: "radial-gradient(circle, rgba(200,255,0,0.12) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{
          fontSize: 11, fontWeight: 600, letterSpacing: ".08em",
          color: "var(--lime)", textTransform: "uppercase", fontFamily: "DM Mono, monospace",
        }}>
          ✦ Link created
        </span>
        <span style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "DM Mono, monospace" }}>
          View clicks in My Links →
        </span>
      </div>

      {/* Short URL row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <a
          href={result.shortUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1, fontFamily: "DM Mono, monospace", fontSize: 15,
            fontWeight: 500, color: "var(--lime)", textDecoration: "none",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
        >
          {result.shortUrl}
        </a>

        {/* Copy button */}
        <button
          onClick={copy}
          className="btn-primary"
          style={{
            padding: "7px 14px", borderRadius: 8, fontSize: 12,
            fontWeight: 600, display: "flex", alignItems: "center",
            gap: 6, whiteSpace: "nowrap", flexShrink: 0,
          }}
        >
          {copied ? (
            <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--lime-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> Copied!</>
          ) : (
            <><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke="var(--lime-text)" strokeWidth="1.5"/><path d="M1 8V2a1 1 0 011-1h6" stroke="var(--lime-text)" strokeWidth="1.5" strokeLinecap="round"/></svg> Copy</>
          )}
        </button>

        {/* QR Code toggle button */}
        <button
          onClick={() => setShowQR(v => !v)}
          title="Show QR Code"
          style={{
            width: 34, height: 34, borderRadius: 8, flexShrink: 0,
            border: "1px solid var(--border)",
            background: showQR ? "var(--surface-2)" : "var(--surface)",
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
          {/* QR icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
            <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 17v3M17 14h3"/>
          </svg>
        </button>
      </div>

      {/* Original URL */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: showQR ? 16 : 12 }}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ flexShrink: 0 }}>
          <path d="M1 5h8M5 1l4 4-4 4" stroke="var(--text-3)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 12, color: "var(--text-2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {result.originalUrl}
        </span>
      </div>

      {/* QR Code Section — shown when toggle clicked */}
      {showQR && (
        <div style={{
          borderTop: "1px solid var(--border)",
          paddingTop: 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          animation: "fadeIn 0.25s ease",
        }}>
          <p style={{ fontSize: 11, color: "var(--text-2)", fontFamily: "DM Mono, monospace", letterSpacing: ".04em" }}>
            SCAN QR CODE
          </p>
          {/* QR image — backend generates PNG using ZXing */}
          <div style={{
            padding: 12,
            background: "#ffffff", // always white background for QR code readability
            borderRadius: 12,
            border: "1px solid var(--border)",
            display: "inline-block",
          }}>
            <img
              src={qrUrl}
              alt={`QR code for ${result.shortUrl}`}
              width={180}
              height={180}
              style={{ display: "block", borderRadius: 4 }}
              onError={e => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
          {/* Download QR button */}
          <a
            href={qrUrl}
            download={`snip-qr-${result.shortCode}.png`}
            style={{
              fontSize: 12, color: "var(--text-2)",
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: 6,
              border: "1px solid var(--border)",
              padding: "6px 14px", borderRadius: 8,
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
            </svg>
            Download QR
          </a>
        </div>
      )}

      {/* My Links link */}
      {!showQR && (
        <a
          href="/list"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 12, color: "var(--text-2)", textDecoration: "none",
            border: "1px solid var(--border)", borderRadius: 8,
            padding: "6px 12px", transition: "all .2s",
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
          View all my links & click counts →
        </a>
      )}
    </div>
  );
}
