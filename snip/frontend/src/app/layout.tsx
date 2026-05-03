import type { Metadata } from "next";
import { Syne, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Snip — Smart URL Shortener",
  description: "Shorten, track, and manage your links with Snip.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${dmSans.variable} ${dmMono.variable}`}>
        {children}
        {/* Keep backend alive — pings every 10 minutes to prevent Render free tier sleep */}
        <script dangerouslySetInnerHTML={{
          __html: `
            setInterval(function() {
              fetch('https://smart-url-shortener-a29p.onrender.com/api/urls')
                .catch(function() {});
            }, 600000);
          `
        }} />
      </body>
    </html>
  );
}