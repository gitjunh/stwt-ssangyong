import { localAdmin } from '../store/adminEntities'

/** 방문 신청 시드·데모에 쓰이는 담당자 이름(관리 사용자와 별도일 수 있음) */
export const DEMO_HOST_NAMES = ['김담당', '이담당', '박담당', '최담당', '정담당', '테스트담당'] as const

export type HostSearchHit = {
  name: string
  department: string
  mobile: string
  source: 'user' | 'demo'
}

export function searchHosts(query: string): HostSearchHit[] {
  const q = query.trim()
  if (!q) return []

  const hits: HostSearchHit[] = []
  const seen = new Set<string>()

  for (const user of localAdmin.listUsers()) {
    if (user.active === false) continue
    const match =
      user.name.includes(q) ||
      user.username.toLowerCase().includes(q.toLowerCase()) ||
      (user.department || '').includes(q)
    if (!match) continue
    if (seen.has(user.name)) continue
    seen.add(user.name)
    hits.push({
      name: user.name,
      department: user.department || '-',
      mobile: user.mobile || '',
      source: 'user',
    })
  }

  for (const name of DEMO_HOST_NAMES) {
    if (!name.includes(q) || seen.has(name)) continue
    seen.add(name)
    hits.push({
      name,
      department: '방문담당',
      mobile: '',
      source: 'demo',
    })
  }

  return hits
}
