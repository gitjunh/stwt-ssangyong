/** 입주민 메인 현관(동 출입문) 임시 오픈 기록 */

export type DoorOpenReason = '배달' | '택배' | '방문객' | '기타'

export type DoorOpen = {
  id: string
  residentId: string
  dong: string
  ho: string
  reason: DoorOpenReason
  note: string
  minutes: number
  openedAt: string
  expiresAt: string
}

const KEY = 'ssangyong-door-opens'

function read(): DoorOpen[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as DoorOpen[]
  } catch {
    return []
  }
}

function write(rows: DoorOpen[]) {
  window.localStorage.setItem(KEY, JSON.stringify(rows))
}

export function listDoorOpens(dong?: string): DoorOpen[] {
  const all = read().sort((a, b) => b.openedAt.localeCompare(a.openedAt))
  if (!dong) return all
  return all.filter((r) => r.dong === dong)
}

export function createDoorOpen(input: {
  residentId: string
  dong: string
  ho: string
  reason: DoorOpenReason
  note?: string
  minutes: number
}): DoorOpen {
  const openedAt = new Date()
  const expiresAt = new Date(openedAt.getTime() + input.minutes * 60_000)
  const row: DoorOpen = {
    id: `door-${Date.now()}`,
    residentId: input.residentId,
    dong: input.dong,
    ho: input.ho,
    reason: input.reason,
    note: (input.note ?? '').trim(),
    minutes: input.minutes,
    openedAt: openedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  }
  write([row, ...read()])
  return row
}

export function isDoorOpenActive(row: DoorOpen, now = Date.now()): boolean {
  return new Date(row.expiresAt).getTime() > now
}
