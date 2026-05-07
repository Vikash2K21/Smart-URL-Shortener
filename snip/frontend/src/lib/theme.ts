// Theme utility — saves preference in localStorage
// and applies class to <html> element

export type Theme = "dark" | "light";

export function getTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("snip_theme") as Theme) || "dark";
}

export function setTheme(theme: Theme): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("snip_theme", theme);
  if (theme === "light") {
    document.documentElement.classList.add("light");
  } else {
    document.documentElement.classList.remove("light");
  }
}

export function toggleTheme(): Theme {
  const current = getTheme();
  const next: Theme = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

export function initTheme(): void {
  // Call on app load to restore saved preference
  const saved = getTheme();
  setTheme(saved);
}
