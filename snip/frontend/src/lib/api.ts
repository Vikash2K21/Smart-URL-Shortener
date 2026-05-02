import { ShortenResponse } from "./types";
import { getSessionId } from "./session";

const BASE = "/api";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Session-Id": getSessionId(),
  };
}

export async function shortenUrl(url: string, customCode?: string): Promise<ShortenResponse> {
  const res = await fetch(`${BASE}/shorten`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ url, customCode: customCode || undefined }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to shorten URL");
  return data;
}

export async function listUrls(): Promise<ShortenResponse[]> {
  const res = await fetch(`${BASE}/urls`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch URLs");
  return data;
}

export async function resolveUrl(shortCode: string): Promise<ShortenResponse> {
  const res = await fetch(`${BASE}/resolve/${shortCode}`, { headers: headers() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Not found");
  return data;
}

export async function deleteUrl(shortCode: string): Promise<void> {
  const res = await fetch(`${BASE}/urls/${shortCode}`, {
    method: "DELETE",
    headers: headers(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Failed to delete");
  }
}
