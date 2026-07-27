import { useEffect, useState } from 'react'

// Replaces MUI's useMediaQuery + theme.breakpoints — only one call site
// in the app needs it (CollapsibleSidebarPane's sidebar auto-collapse),
// not enough to justify a dependency.
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const listener = () => setMatches(mql.matches)
    listener()
    mql.addEventListener('change', listener)
    return () => mql.removeEventListener('change', listener)
  }, [query])

  return matches
}
