"use client";

import { useEffect, useState } from "react";
import { Moon, SunMedium } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const stored = (localStorage.getItem("theme") as "light" | "dark" | null) || "dark";
    root.classList.toggle("dark", stored === "dark");
    setTheme(stored);
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border)] bg-[color:var(--card-subtle)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5"
      aria-label="Toggle theme"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--accent)] text-slate-950">
        {mounted && theme === "dark" ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
      </span>
      <span className="hidden sm:inline">{mounted && theme === "dark" ? "Dark mode" : "Light mode"}</span>
    </button>
  );
}
