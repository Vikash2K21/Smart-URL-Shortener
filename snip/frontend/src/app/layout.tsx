import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Snip — Smart URL Shortener",
  description: "Shorten, track, and manage your links.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-mesh" />
        <div className="bg-grid" />
        {children}

        {/* Restore saved theme before first paint — prevents flash */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('snip_theme') || 'dark';
                if (theme === 'light') {
                  document.documentElement.classList.add('light');
                }
              } catch(e) {}
            })();

            // Keep backend alive — ping every 5 minutes
            setInterval(function() {
              fetch('https://smart-url-shortener-a29p.onrender.com/api/urls')
                .catch(function() {});
            }, 300000);
          `
        }} />
      </body>
    </html>
  );
}
