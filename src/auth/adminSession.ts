const SESSION_KEY = 'ssangyong-admin-session'

export function setAdminSession(id: string): void {
  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify({ id, at: Date.now() }))
}

export function getAdminSession(): { id: string; at: number } | null {
  const raw = window.sessionStorage.getItem(SESSION_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as { id: string; at: number }
  } catch {
    return null
  }
}

export function clearAdminSession(): void {
  window.sessionStorage.removeItem(SESSION_KEY)
}

export function isAdminLoggedIn(): boolean {
  return getAdminSession() !== null
}
