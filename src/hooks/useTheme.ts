import { useState, useEffect } from "react";

export default function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("tp-theme") || "auto");

  useEffect(() => {
    localStorage.setItem("tp-theme", theme);
    if (theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme((prev) => (prev === "auto" ? "auto" : prev));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return { theme, setTheme };
}
