"use client";

import { useEffect, useRef, useState } from "react";

export function useTypewriter(
  text: string,
  active: boolean,
  speedMs: number,
  onComplete?: () => void
) {
  const [displayed, setDisplayed] = useState("");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!active) return;

    let index = 0;
    setDisplayed("");

    const tick = () => {
      index += 1;
      const next = text.slice(0, index);
      setDisplayed(next);
      if (index >= text.length) {
        onCompleteRef.current?.();
        return;
      }
      timer = window.setTimeout(tick, speedMs);
    };

    let timer = window.setTimeout(tick, speedMs);
    return () => window.clearTimeout(timer);
  }, [text, active, speedMs]);

  return displayed;
}