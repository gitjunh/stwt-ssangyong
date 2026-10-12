export type Notice = {
  id: string
  title: string
  body: string
  createdAt: string
}

const KEY = 'ssangyong-community'

const SEED: Notice[] = [
  {
    id: 'n1',
    title: '엘리베이터 점검 안내',
    body: '101동 엘리베이터 정기 점검이 예정되어 있습니다.',
    createdAt: '2026-10-10T09:00:00',
  },
]

function read(): Notice[] {
  if (typeof window === 'undefined') return [...SEED]
  const raw = window.localStorage.getItem(KEY)
  if (!raw) {
    window.localStorage.setItem(KEY, JSON.stringify(SEED))
    return [...SEED]
  }
  try {
    return JSON.parse(raw) as Notice[]
  } catch {
    return [...SEED]
  }
}

function write(rows: Notice[]) {
  window.localStorage.setItem(KEY, JSON.stringify(rows))
}

export const communityStore = {
  list: () => read().slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  add: (title: string, body: string) => {
    const row: Notice = {
      id: `n-${Date.now()}`,
      title,
      body,
      createdAt: new Date().toISOString(),
    }
    const all = read()
    all.unshift(row)
    write(all)
    return row
  },
}
