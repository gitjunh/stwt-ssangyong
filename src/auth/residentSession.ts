const KEY = 'ssangyong-resident-session'

export function setResidentSession(id: string): void {
  window.sessionStorage.setItem(KEY, JSON.stringify({ id, at: Date.now() }))
}

export function getResidentSession(): { id: string; at: number } | null {
  const raw = window.sessionStorage.getItem(KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { id: string; at: number }
  } catch {
    return null
  }
}

export function clearResidentSession(): void {
  window.sessionStorage.removeItem(KEY)
}

export function isResidentLoggedIn(): boolean {
  return getResidentSession() !== null
}
