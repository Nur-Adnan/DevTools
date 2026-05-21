"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full bg-surface-container-high/60 border border-outline-variant/30 flex items-center justify-center shrink-0" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-highest transition-colors rounded-full cursor-pointer flex items-center justify-center border border-outline-variant/30 hover:border-outline-variant shrink-0"
      title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {theme === "dark" ? (
        <Sun className="h-4.5 w-4.5 text-amber-500 fill-amber-500/20" />
      ) : (
        <Moon className="h-4.5 w-4.5 text-teal-700 fill-teal-700/10" />
      )}
    </button>
  );
}
