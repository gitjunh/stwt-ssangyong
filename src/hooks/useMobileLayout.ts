import { useEffect } from 'react'

const QUERY = '(max-width: 720px)'

function fallbackMatchMedia(query: string): MediaQueryList {
  const max = /max-width:\s*(\d+)px/.exec(query)
  const matches = max ? window.innerWidth <= Number(max[1]) : false
  return {
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }
}

export function useMobileLayout() {
  useEffect(() => {
    const mq = typeof window.matchMedia === 'function'
      ? window.matchMedia(QUERY)
      : fallbackMatchMedia(QUERY)
    const apply = () => {
      document.documentElement.dataset.viewport = mq.matches ? 'mobile' : 'desktop'
    }
    apply()
    mq.addEventListener?.('change', apply)
    return () => {
      mq.removeEventListener?.('change', apply)
      delete document.documentElement.dataset.viewport
    }
  }, [])
}
