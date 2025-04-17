"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !query) return undefined

    // Set initial value based on the current window size
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    // Add listener for changes with proper cleanup
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches)
    mediaQuery.addEventListener("change", handler)

    // Clean up
    return () => mediaQuery.removeEventListener("change", handler)
  }, [query])

  return matches
}
