"use client";

import { useEffect, useState, useRef } from "react";

const phrases = [
  "que facilitam o trabalho",
  "e aplicativos inteligentes",
  "porque quero dinheiro",
];

const LAST_PHRASE_INDEX = 2;

export default function HeroRotatingText() {
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const waitingRef = useRef(false);
  const spanRef = useRef<HTMLSpanElement>(null);

  const currentPhrase = phrases[phraseIndex];

  // Observe hero — when less than 65% visible, pause the typing
  useEffect(() => {
    const heroEl = spanRef.current?.closest("header");
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.85 },
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Not visible — freeze everything immediately
    if (!isVisible) return;

    if (waitingRef.current) return;

    const typingSpeed = 80;
    const deletingSpeed = 30;
    const pauseAfterTyping = 2000;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (charIndex < currentPhrase.length) {
            setDisplayText(currentPhrase.substring(0, charIndex + 1));
            setCharIndex(charIndex + 1);
          } else {
            if (phraseIndex === LAST_PHRASE_INDEX) {
              setIsDeleting(true);
            } else {
              waitingRef.current = true;
              setTimeout(() => {
                waitingRef.current = false;
                setIsDeleting(true);
              }, pauseAfterTyping);
            }
          }
        } else {
          if (charIndex > 0) {
            setDisplayText(currentPhrase.substring(0, charIndex - 1));
            setCharIndex(charIndex - 1);
          } else {
            setIsDeleting(false);
            setPhraseIndex((prev) => (prev + 1) % phrases.length);
          }
        }
      },
      isDeleting ? deletingSpeed : typingSpeed,
    );

    return () => clearTimeout(timeout);
  }, [charIndex, currentPhrase, isDeleting, phraseIndex, isVisible]);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, []);

  return (
    <span ref={spanRef} className="inline leading-normal">
      sites{" "}
      {displayText && (
        <span className="bg-acid text-[#000000] px-2 md:px-4 inline">{displayText}</span>
      )}
      <span
        className="inline"
        style={{ opacity: showCursor ? 1 : 0 }}
        aria-hidden="true"
      >
        |
      </span>
    </span>
  );
}
