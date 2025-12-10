// src/hooks/useIsMobile.js
import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  // İlk değer (SSR / güvenli kontrol)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

    const handleChange = (e) => {
      setIsMobile(e.matches);
    };

    // İlk çalıştırma
    setIsMobile(mq.matches);

    mq.addEventListener("change", handleChange);

    return () => {
      mq.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);

  return isMobile;
}
