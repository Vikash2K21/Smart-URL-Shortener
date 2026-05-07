"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getTheme, toggleTheme, initTheme, Theme } from "@/lib/theme";

export default function Navbar() {
  const path = usePathname();
  const [theme, setTheme] = useState<Theme>("dark");

  // Restore saved theme on mount
  useEffect(() => {
    initTheme();
    setTheme(getTheme());
  }, []);

  function handleToggle() {
    const next = toggleTheme();
    setTheme(next);
  }

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      borderBottom: "1px solid var(--border)",
      background: "var(--bg-nav)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      transition: "background 0.3s ease",
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 24px",
        height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--lime)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(200,255,0,0.3)",
            transition: "background 0.3s ease",
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M7 2l5 5-5 5" stroke="var(--lime-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{
            fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 17,
            color: "var(--text)", letterSpacing: "-0.02em",
            transition: "color 0.3s ease",
          }}>
            snip
          </span>
        </Link>

        {/* Right side — nav links + toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>

          {/* Nav links */}
          {[
            { href: "/", label: "Shorten" },
            { href: "/list", label: "My Links" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              textDecoration: "none",
              padding: "6px 14px", borderRadius: 8,
              fontSize: 13, fontWeight: 500,
              transition: "all .2s",
              color: path === href ? "var(--text)" : "var(--text-2)",
              background: path === href ? "var(--surface-2)" : "transparent",
              border: path === href ? "1px solid var(--border)" : "1px solid transparent",
            }}>
              {label}
            </Link>
          ))}

          {/* Dark / Light toggle button */}
          <button
            onClick={handleToggle}
            className="theme-toggle"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{ marginLeft: 8 }}
          >
            {theme === "dark" ? (
              // Sun icon — click to go light
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              // Moon icon — click to go dark
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
