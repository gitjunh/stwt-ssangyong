/** 입주자 명부 — 관리소가 주기 갱신, 활성 입주자만 방문 승인 가능 */

export type Resident = {
  id: string
  loginId: string
  name: string
  phone: string
  dong: string
  ho: string
  active: boolean
  password: string
}

const KEY = 'ssangyong-residents'
const SEED_FLAG = 'ssangyong-residents-v2'

const SEED: Resident[] = [
  { id: 'r1', loginId: '1234', name: '김입주', phone: '01011110001', dong: '101', ho: '1201', active: true, password: '1234' },
  { id: 'r2', loginId: '1235', name: '이입주', phone: '01011110002', dong: '101', ho: '1503', active: true, password: '1234' },
  { id: 'r3', loginId: '1236', name: '박입주', phone: '01011110003', dong: '102', ho: '803', active: true, password: '1234' },
  { id: 'r4', loginId: '1237', name: '최비활성', phone: '01011110004', dong: '103', ho: '501', active: false, password: '1234' },
]

function normalize(row: Partial<Resident> & { id: string }): Resident {
  const fallback = SEED.find((s) => s.id === row.id)
  return {
    id: row.id,
    loginId: row.loginId || fallback?.loginId || row.phone || row.id,
    name: row.name || fallback?.name || '',
    phone: row.phone || fallback?.phone || '',
    dong: row.dong || fallback?.dong || '',
    ho: row.ho || fallback?.ho || '',
    active: row.active ?? fallback?.active ?? true,
    password: row.password || fallback?.password || '1234',
  }
}

function read(): Resident[] {
  if (typeof window === 'undefined') return [...SEED]
  const seeded = window.localStorage.getItem(SEED_FLAG)
  const raw = window.localStorage.getItem(KEY)
  if (!raw || seeded !== '1') {
    window.localStorage.setItem(KEY, JSON.stringify(SEED))
    window.localStorage.setItem(SEED_FLAG, '1')
    return [...SEED]
  }
  try {
    return (JSON.parse(raw) as Partial<Resident>[]).map((r) => normalize(r as Resident))
  } catch {
    return [...SEED]
  }
}

function write(rows: Resident[]) {
  window.localStorage.setItem(KEY, JSON.stringify(rows))
}

export const residentsStore = {
  list: () => read(),
  listActive: () => read().filter((r) => r.active),
  findById: (id: string) => read().find((r) => r.id === id) ?? null,
  findByPhone: (phone: string) => read().find((r) => r.phone === phone) ?? null,
  findByLoginId: (loginId: string) => {
    const id = loginId.trim()
    return read().find((r) => r.loginId === id || r.phone === id) ?? null
  },
  search: (q: string) => {
    const n = q.trim()
    if (!n) return []
    const parts = n.split(/\s+/).filter(Boolean)
    return read().filter((r) => {
      if (!r.active) return false
      const blob = `${r.name} ${r.dong} ${r.ho} ${r.dong}-${r.ho}`
      return parts.every((p) => blob.includes(p) || r.name.includes(p))
    })
  },
  upsert: (row: Resident) => {
    const all = read()
    const i = all.findIndex((r) => r.id === row.id)
    if (i >= 0) all[i] = row
    else all.push(row)
    write(all)
    return row
  },
  setActive: (id: string, active: boolean) => {
    const all = read()
    const i = all.findIndex((r) => r.id === id)
    if (i < 0) return null
    all[i] = { ...all[i], active }
    write(all)
    return all[i]
  },
  canApproveVisits: (id: string) => {
    const r = read().find((x) => x.id === id)
    return !!r?.active
  },
}
