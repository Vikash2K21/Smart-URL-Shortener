"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-paper/90 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-800 text-xl text-ink tracking-tight">
          snip<span className="text-accent">.</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              path === "/" ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            Shorten
          </Link>
          <Link
            href="/list"
            className={`text-sm font-medium transition-colors ${
              path === "/list" ? "text-ink" : "text-muted hover:text-ink"
            }`}
          >
            My Links
          </Link>
        </div>
      </div>
    </nav>
  );
}
