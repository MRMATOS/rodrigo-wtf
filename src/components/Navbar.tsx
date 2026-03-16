"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

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
    const r = document.documentElement;
    if (r.classList.contains("dark")) {
      r.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      r.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  const ThemeIcon = () => isDark ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.9 1.2 1.5 1.5 2.5"/>
      <path d="M9 18h6"/>
      <path d="M10 22h4"/>
    </svg>
  );

  return (
    <div className="sticky top-4 z-50 relative" ref={menuRef}>
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

        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={toggleDark}
            className="brutal-btn flex items-center justify-center bg-background hover:bg-acid text-foreground dark:hover:text-[#000000] active:translate-x-[6px] active:translate-y-[6px]"
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            <ThemeIcon />
          </button>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/servicos"
            className={`font-body text-sm font-bold uppercase tracking-wide border-b-3 pb-0.5 ${
              pathname === "/servicos"
                ? "text-blue border-blue dark:text-acid dark:border-acid"
                : "border-transparent hover:border-foreground"
            }`}
            style={{ transition: "border-color 0s" }}
          >
            Serviços
          </Link>
          <button
            className="font-body text-sm font-bold uppercase tracking-wide opacity-50 cursor-not-allowed"
            disabled
          >
            Ferramentas
          </button>
          <button
            className="font-body text-sm font-bold uppercase tracking-wide opacity-50 cursor-not-allowed"
            disabled
          >
            Conteúdo
          </button>
          <Link
            href="/#about"
            className={`font-body text-sm font-bold uppercase tracking-wide border-b-3 pb-0.5 ${
              pathname === "/#about"
                ? "text-blue border-blue dark:text-acid dark:border-acid"
                : "border-transparent hover:border-foreground"
            }`}
            style={{ transition: "border-color 0s" }}
          >
            Sobre
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Toggle Button (Mobile) */}
          <button
            onClick={toggleDark}
            className="text-foreground min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-3 focus-visible:outline-acid hover:text-acid dark:hover:text-acid"
            aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
          >
            <ThemeIcon />
          </button>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-2xl font-body font-bold leading-none focus-visible:outline-3 focus-visible:outline-acid min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
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
              className={`font-body text-base uppercase tracking-wide py-3 border-b-3 border-border ${
                pathname === "/servicos" ? "text-blue dark:text-acid" : ""
              }`}
            >
              Serviços
            </Link>
            <button
              className="font-body text-base uppercase tracking-wide py-3 border-b-3 border-border text-left opacity-50 cursor-not-allowed"
              disabled
            >
              Ferramentas
            </button>
            <button
              className="font-body text-base uppercase tracking-wide py-3 border-b-3 border-border text-left opacity-50 cursor-not-allowed"
              disabled
            >
              Conteúdo
            </button>
            <Link
              href="#about"
              onClick={() => setMenuOpen(false)}
              className="font-body text-base uppercase tracking-wide py-3"
            >
              Sobre
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
