import Navbar from "./_components/Navbar";
import ShortenForm from "./_components/ShortenForm";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-paper pt-14 flex flex-col items-center justify-center px-6">
        {/* Hero */}
        <div className="w-full max-w-xl space-y-10">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-muted border border-border bg-white rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Smart URL Shortener
            </div>
            <h1 className="font-display text-5xl font-extrabold text-ink leading-none tracking-tight">
              Long links,<br />
              <span className="text-accent">snipped.</span>
            </h1>
            <p className="text-muted text-base max-w-sm">
              Paste a URL, get a clean short link. Track clicks, manage your links, done.
            </p>
          </div>

          <ShortenForm />

          {/* Features row */}
          <div className="flex items-center gap-6 text-xs text-muted">
            <span className="flex items-center gap-1.5">
              <span className="text-accent">✦</span> Click tracking
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent">✦</span> Custom codes
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-accent">✦</span> Rate limited
            </span>
          </div>
        </div>
      </main>
    </>
  );
}
