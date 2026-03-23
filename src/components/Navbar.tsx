"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/contexts/LanguageContext";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [isChaos, setIsChaos] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const clickCountRef = useRef(0);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { lang, t, toggle: toggleLang } = useT();

  const CHAOS_VARS = ["--bg", "--fg", "--acid", "--border-color", "--blue", "--magenta"];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const applyChaos = useCallback(() => {
    const hex = () => "#" + Array.from({ length: 3 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, "0")
    ).join("");
    CHAOS_VARS.forEach((v) => document.documentElement.style.setProperty(v, hex()));
  }, []);

  const resetChaos = useCallback(() => {
    CHAOS_VARS.forEach((v) => document.documentElement.style.removeProperty(v));
    setIsChaos(false);
    clickCountRef.current = 0;
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast(null);
  }, []);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleDark = () => {
    if (isChaos) {
      applyChaos();
      return;
    }

    clickCountRef.current += 1;
    const count = clickCountRef.current;

    const r = document.documentElement;
    if (r.classList.contains("dark")) {
      r.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
      new Audio("/dark-to-light.mp3").play().catch(() => { });
    } else {
      r.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
      new Audio("/light-to-dark.mp3").play().catch(() => { });
    }

    if (count >= 10) {
      applyChaos();
      setIsChaos(true);
      showToast(t.navbar.easterEgg[0]);
    } else if (count >= 8) {
      showToast(t.navbar.easterEgg[1]);
    } else if (count >= 5) {
      showToast(t.navbar.easterEgg[2]);
    }
  };

  const ThemeIcon = () => isDark ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );

  return (
    <div className="sticky top-4 z-[100] relative" ref={menuRef}>
      <nav className="border-3 border-border bg-background brutal-shadow flex justify-between items-center px-4 md:px-8 py-3 md:py-4 relative">
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setMenuOpen(false)}
          className="font-heading text-xl md:text-2xl font-bold uppercase tracking-tight bg-foreground text-background px-3 py-1 hover:bg-acid hover:text-[#000000]"
          style={{
            transitionTimingFunction: "steps(1)",
            transitionDuration: "0s",
            transitionProperty: "background-color, color",
          }}
        >
          rodrigo.wtf
        </Link>

        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleLang}
              className="brutal-btn flex items-center justify-center bg-background hover:bg-acid text-foreground dark:hover:text-[#000000] active:translate-x-[6px] active:translate-y-[6px] text-xs font-bold tracking-widest"
              aria-label={t.navbar.toggleLang}
              title={t.navbar.toggleLang}
            >
              {lang === "pt" ? "EN" : "BR"}
            </button>
            <button
              onClick={toggleDark}
              className="brutal-btn flex items-center justify-center bg-background hover:bg-acid text-foreground dark:hover:text-[#000000] active:translate-x-[6px] active:translate-y-[6px]"
              aria-label={isDark ? t.navbar.toggleLight : t.navbar.toggleDark}
            >
              <ThemeIcon />
            </button>
          </div>
          {toast && (
            <span className="absolute top-full mt-3 whitespace-nowrap font-body text-[10px] font-bold uppercase tracking-widest bg-foreground text-background px-2 py-1 pointer-events-none">
              // {toast}
            </span>
          )}
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/servicos"
            className={`font-body text-sm font-bold uppercase tracking-wide border-b-3 pb-0.5 ${pathname === "/servicos"
                ? "text-blue border-blue dark:text-acid dark:border-acid"
                : "border-transparent hover:border-foreground"
              }`}
            style={{ transition: "border-color 0s" }}
          >
            {t.navbar.services}
          </Link>
          <Link
            href="/ferramentas"
            className={`font-body text-sm font-bold uppercase tracking-wide border-b-3 pb-0.5 ${pathname.startsWith("/ferramentas")
                ? "text-blue border-blue dark:text-acid dark:border-acid"
                : "border-transparent hover:border-foreground"
              }`}
            style={{ transition: "border-color 0s" }}
          >
            {t.navbar.tools}
          </Link>
          <Link
            href="/conteudo"
            className={`font-body text-sm font-bold uppercase tracking-wide border-b-3 pb-0.5 ${pathname.startsWith("/conteudo")
                ? "text-blue border-blue dark:text-acid dark:border-acid"
                : "border-transparent hover:border-foreground"
              }`}
            style={{ transition: "border-color 0s" }}
          >
            {t.navbar.content}
          </Link>
          <Link
            href="/sobre"
            className={`font-body text-sm font-bold uppercase tracking-wide border-b-3 pb-0.5 ${pathname === "/sobre"
                ? "text-blue border-blue dark:text-acid dark:border-acid"
                : "border-transparent hover:border-foreground"
              }`}
            style={{ transition: "border-color 0s" }}
          >
            {t.navbar.about}
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Language Toggle Button (Mobile) */}
          <button
            onClick={toggleLang}
            className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-3 focus-visible:outline-acid hover:text-acid dark:hover:text-acid text-xs font-bold tracking-widest"
            aria-label={t.navbar.toggleLang}
            title={t.navbar.toggleLang}
          >
            {lang === "pt" ? "BR" : "EN"}
          </button>

          {/* Theme Toggle Button (Mobile) */}
          <div className="relative">
            <button
              onClick={toggleDark}
              className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-3 focus-visible:outline-acid hover:text-acid dark:hover:text-acid"
              aria-label={isDark ? t.navbar.toggleLight : t.navbar.toggleDark}
            >
              <ThemeIcon />
            </button>
            {toast && (
              <span className="absolute top-full right-0 mt-2 whitespace-nowrap font-body text-[10px] font-bold uppercase tracking-widest bg-foreground text-background px-2 py-1 pointer-events-none z-50">
                // {toast}
              </span>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl font-body font-bold leading-none focus-visible:outline-3 focus-visible:outline-acid min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={menuOpen ? t.navbar.closeMenu : t.navbar.openMenu}
            aria-expanded={menuOpen}
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute left-0 right-0 top-full border-3 border-t-0 border-blue bg-background brutal-shadow">
          <div className="flex flex-col px-4 py-6 gap-4">
            <Link
              href="/servicos"
              onClick={() => setMenuOpen(false)}
              className={`font-body text-base uppercase tracking-wide py-3 border-b-3 border-border ${pathname === "/servicos" ? "text-blue dark:text-acid" : ""
                }`}
            >
              {t.navbar.services}
            </Link>
            <Link
              href="/ferramentas"
              onClick={() => setMenuOpen(false)}
              className={`font-body text-base uppercase tracking-wide py-3 border-b-3 border-border ${pathname.startsWith("/ferramentas") ? "text-blue dark:text-acid" : ""
                }`}
            >
              {t.navbar.tools}
            </Link>
            <Link
              href="/conteudo"
              onClick={() => setMenuOpen(false)}
              className={`font-body text-base uppercase tracking-wide py-3 border-b-3 border-border ${pathname.startsWith("/conteudo") ? "text-blue dark:text-acid" : ""
                }`}
            >
              {t.navbar.content}
            </Link>
            <Link
              href="/sobre"
              onClick={() => setMenuOpen(false)}
              className={`font-body text-base uppercase tracking-wide py-3 ${pathname === "/sobre" ? "text-blue dark:text-acid" : ""
                }`}
            >
              {t.navbar.about}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
