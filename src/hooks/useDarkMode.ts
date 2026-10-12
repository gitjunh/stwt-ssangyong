import { useEffect } from 'react'

/** 방문 화면은 다크 모드만 유지한다. */
export function applyTheme() {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.theme = 'dark'
  document.documentElement.style.colorScheme = 'dark'
}

export function useDarkMode() {
  useEffect(() => {
    applyTheme()
  }, [])

  return {
    dark: true,
    themeClass: 'visitor-dark' as const,
  }
}

/** 방문 위저드·조회 등 — 항상 visitor-dark */
export function useVisitorThemeClass() {
  useEffect(() => {
    applyTheme()
  }, [])

  return 'visitor-dark' as const
}
