import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

if (typeof window.matchMedia !== 'function') {
  window.matchMedia = ((query: string) => {
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
  }) as typeof window.matchMedia
}

afterEach(() => {
  delete document.documentElement.dataset.viewport
})
