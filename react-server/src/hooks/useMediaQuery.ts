import { useEffect, useState } from "react";

// Tailwind's default breakpoints
const breakpoints: Record<string, string> = {
  "sm": "(min-width: 640px)",
  "md": "(min-width: 768px)",
  "lg": "(min-width: 1024px)",
  "xl": "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
};

export default function useMediaQuery(aliasOrQuery: string): boolean {
  const query: string = breakpoints[aliasOrQuery] || aliasOrQuery;
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery: MediaQueryList = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
