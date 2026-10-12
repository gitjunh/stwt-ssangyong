/**
 * 관리 CRUD용 localStorage 스토어.
 * 기초코드 기본값은 `src/data/adminCodesSeed.json` (배포 시드)에서 읽는다.
 */

import adminCodesSeed from '../data/adminCodesSeed.json'

export type UserRow = {
  id: number
  username: string
  name: string
  nameEn: string
  department: string
  landline: string
  mobile: string
  email: string
  location: string
  role: string
  active: boolean
  password: string
  groupCode: string | null
  departmentId: number | null
  createdAt?: string
}

export type GroupRow = { code: string; name: string }

export type PermissionRow = {
  id: number
  groupCode: string
  menuName: string
  permissionName: string
  allowed: boolean
}

export type DeptRow = {
  id: number
  code: string
  name: string
  parentId?: number | null
  section?: string
  rank?: number
  active?: boolean
}

/** LOCATION | PURPOSE | VISIT_CARD | DEVICE */
export type CodeCategory = 'LOCATION' | 'PURPOSE' | 'VISIT_CARD' | 'DEVICE' | string

export type CodeRow = {
  id: number
  category: CodeCategory
  code: string
  name: string
  nameEn: string
  sortOrder: number
  active: boolean
  /** LOCATION: 방문지역 */
  area?: string
  /** VISIT_CARD: 방문유형 */
  visitType?: string
}

export const CODE_VISIT_AREAS = ['정문게이트', '단지내'] as const
export const CODE_VISIT_TYPES = ['정기출입', '방문(일반)', '단기근로', '공사(납품)'] as const

export type VisitCardRow = {
  id: number
  cardNo: string
  cardName?: string
  visitorName: string
  phone?: string | null
  company?: string
  vehicle?: string
  purpose?: string
  place?: string
  visitType?: string
  visitStart?: string
  visitEnd?: string
  host?: string
  hostPhone?: string
  applicationId?: string | null
  status: string
  issuedAt?: string | null
  returnedAt?: string | null
}

export type AccessLogRow = {
  id: number
  visitorName: string
  cardNo?: string | null
  cardName?: string
  direction: string
  loggedAt: string
  issuedAt?: string
  returnedAt?: string
  visitType?: string
  company?: string
  title?: string
  host?: string
}

export const USER_LOCATION_FIXED = '정문게이트'
export const USER_PASSWORD_RESET = 'ssangyong-reset-01'

export const USER_DEPARTMENTS = [
  '관리팀',
  '경비',
  '시설',
  '미화',
  '안전환경',
  '총무팀',
  '인사팀',
  '구매팀',
  '시설관리',
  '보안팀',
  '물류팀',
  'IT지원',
  '경영지원',
] as const

export const USER_ROLES = ['관리자', '담당자', '결재자', 'STEC'] as const

const KEY = 'ssangyong-admin-entities'
const DEMO_FLAG = 'demoUsersV22'
const CODES_FLAG = 'demoCodesV23'

/** 배포에 포함된 기초코드 시드 버전. 올리면 기존 브라우저 코드도 시드로 갱신된다. */
export const BUNDLED_CODES_SEED_VERSION = Number(adminCodesSeed.seedVersion) || 1

export type CodesSeedFile = {
  seedVersion: number
  codes: Array<Omit<CodeRow, 'id'> & Partial<Pick<CodeRow, 'id'>>>
}

type Bundle = {
  users: UserRow[]
  groups: GroupRow[]
  permissions: PermissionRow[]
  departments: DeptRow[]
  codes: CodeRow[]
  visitCards: VisitCardRow[]
  accessLogs: AccessLogRow[]
  nextIds: Record<string, number>
  codesSeedVersion?: number
  [DEMO_FLAG]?: boolean
  [CODES_FLAG]?: boolean
}

const DEMO_NAMES = [
  '김민수',
  '이서연',
  '박준호',
  '최유진',
  '정하늘',
  '강동현',
  '윤지아',
  '장성민',
  '임하늘',
  '한지우',
  '오세훈',
  '신예린',
  '권태영',
  '홍수빈',
  '조현우',
  '배지훈',
  '송미경',
  '유재석',
  '문채원',
  '서준영',
]

function roleToGroup(role: string): string {
  if (role === '관리자') return '1001'
  if (role === '담당자') return '1002'
  if (role === '결재자') return '1003'
  return '1004'
}

function buildDemoUsers(startId: number): UserRow[] {
  return DEMO_NAMES.map((name, i) => {
    const n = i + 1
    const role = USER_ROLES[i % USER_ROLES.length]
    const dept = USER_DEPARTMENTS[i % USER_DEPARTMENTS.length]
    const mobileTail = String(1000 + n * 37).slice(-4)
    return {
      id: startId + i,
      username: `t${220000 + n}`,
      name,
      nameEn: '',
      department: dept,
      landline: i % 3 === 0 ? `031-${200 + n}-${1000 + n}` : '',
      mobile: `010${String(3000 + n).slice(-4)}${mobileTail}`,
      email: `user${n}.local`,
      location: USER_LOCATION_FIXED,
      role,
      active: i % 4 !== 3,
      password: USER_PASSWORD_RESET,
      groupCode: roleToGroup(role),
      departmentId: (i % USER_DEPARTMENTS.length) + 1,
      createdAt: new Date().toISOString(),
    }
  })
}

function normalizeCode(raw: Partial<CodeRow> & { id: number }): CodeRow {
  return {
    id: raw.id,
    category: raw.category || 'PURPOSE',
    code: raw.code || '',
    name: raw.name || '',
    nameEn: raw.nameEn ?? '',
    sortOrder: raw.sortOrder ?? 0,
    active: raw.active ?? true,
    area: raw.area,
    visitType: raw.visitType,
  }
}

function codesFromSeedFile(seed: CodesSeedFile): CodeRow[] {
  return (seed.codes || []).map((c, i) =>
    normalizeCode({
      id: i + 1,
      category: c.category || 'PURPOSE',
      code: c.code || '',
      name: c.name || '',
      nameEn: c.nameEn ?? '',
      sortOrder: c.sortOrder ?? 0,
      active: c.active ?? true,
      area: c.area,
      visitType: c.visitType,
    }),
  )
}

function defaultCodes(): CodeRow[] {
  return codesFromSeedFile(adminCodesSeed as CodesSeedFile)
}

function applyCodesSeedToBundle(b: Bundle, seed: CodesSeedFile): void {
  const rows = codesFromSeedFile(seed)
  b.codes = rows
  b.nextIds.codes = Math.max(b.nextIds.codes || 1, ...rows.map((c) => c.id), 0) + 1
  b.codesSeedVersion = Number(seed.seedVersion) || BUNDLED_CODES_SEED_VERSION
  b[CODES_FLAG] = true
}

function normalizeUser(raw: Partial<UserRow> & { id: number }): UserRow {
  const role = raw.role || (raw.groupCode === '1001' ? '관리자' : '담당자')
  return {
    id: raw.id,
    username: raw.username || '',
    name: raw.name || '',
    nameEn: raw.nameEn ?? '',
    department: raw.department || '경영지원',
    landline: raw.landline ?? '',
    mobile: raw.mobile ?? '',
    email: raw.email ?? '',
    location: raw.location || USER_LOCATION_FIXED,
    role,
    active: raw.active ?? true,
    password: raw.password || USER_PASSWORD_RESET,
    groupCode: raw.groupCode ?? roleToGroup(role),
    departmentId: raw.departmentId ?? 1,
    createdAt: raw.createdAt,
  }
}

function defaultBundle(): Bundle {
  const groups: GroupRow[] = [
    { code: '1001', name: '관리자' },
    { code: '1002', name: '담당자' },
    { code: '1003', name: '결재자' },
    { code: '1004', name: 'STEC' },
  ]
  const menus: [string, string[]][] = [
    ['사용자 관리', ['조회', '편집']],
    ['권한그룹 관리', ['조회', '편집']],
    ['부서 관리', ['조회', '편집']],
    ['기초코드 관리', ['조회', '편집']],
    ['방문 승인', ['조회', '편집', '문자전송']],
    ['차량 승인', ['조회', '편집']],
    ['방문자 현황', ['조회', '편집']],
    ['방문카드 발급/반납', ['조회', '편집']],
    ['방문카드 발급/반납 조회', ['조회']],
    ['방문자 출입이력', ['조회']],
  ]
  let pid = 1
  const permissions: PermissionRow[] = []
  for (const g of groups) {
    for (const [menu, perms] of menus) {
      for (const p of perms) {
        permissions.push({
          id: pid++,
          groupCode: g.code,
          menuName: menu,
          permissionName: p,
          allowed: g.code === '1001',
        })
      }
    }
  }

  const admin: UserRow = {
    id: 1,
    username: 'admin',
    name: '관리자',
    nameEn: 'Admin',
    department: '경영지원',
    landline: '031-200-1000',
    mobile: '01011112222',
    email: 'admin.local',
    location: USER_LOCATION_FIXED,
    role: '관리자',
    active: true,
    password: '1234',
    groupCode: '1001',
    departmentId: 1,
    createdAt: new Date().toISOString(),
  }
  const demos = buildDemoUsers(2)

  return {
    users: [admin, ...demos],
    groups,
    permissions,
    departments: [
      { id: 1, code: '1000', name: '관리소', parentId: null, section: '', rank: 1, active: true },
      { id: 2, code: '1001', name: '경영지원', parentId: 1, section: '본사', rank: 1, active: true },
      { id: 3, code: '1002', name: '생산1팀', parentId: 1, section: '공장', rank: 2, active: true },
      { id: 4, code: '1003', name: '생산1팀 A조', parentId: 3, section: '공장', rank: 1, active: true },
      { id: 5, code: '1004', name: '생산1팀 B조', parentId: 3, section: '공장', rank: 2, active: true },
      { id: 6, code: '1005', name: '품질관리', parentId: 1, section: '공장', rank: 3, active: true },
      { id: 7, code: '1006', name: '안전환경', parentId: 1, section: '공장', rank: 4, active: true },
      { id: 8, code: '1007', name: '시설관리', parentId: 1, section: '공장', rank: 5, active: true },
      { id: 9, code: '1008', name: '총무팀', parentId: 2, section: '본사', rank: 1, active: true },
      { id: 10, code: '1009', name: '인사팀', parentId: 2, section: '본사', rank: 2, active: true },
      { id: 11, code: '1010', name: '보안팀', parentId: 1, section: '공장', rank: 6, active: true },
      { id: 12, code: '1011', name: '물류팀', parentId: 1, section: '공장', rank: 7, active: true },
      { id: 13, code: '1012', name: 'IT지원', parentId: 2, section: '본사', rank: 3, active: true },
      { id: 14, code: '1013', name: '정비반', parentId: 8, section: '공장', rank: 1, active: true },
      { id: 15, code: '1014', name: '구매팀', parentId: 2, section: '본사', rank: 4, active: true },
    ],
    codes: defaultCodes(),
    visitCards: defaultVisitCards(),
    accessLogs: defaultAccessLogs(),
    nextIds: {
      users: 2 + demos.length,
      departments: 16,
      codes: defaultCodes().length + 1,
      visitCards: defaultVisitCards().length + 1,
      accessLogs: defaultAccessLogs().length + 1,
      permissions: pid,
    },
    [DEMO_FLAG]: true,
    [CODES_FLAG]: true,
    codesSeedVersion: BUNDLED_CODES_SEED_VERSION,
  }
}

function defaultVisitCards(): VisitCardRow[] {
  const names = ['이창용', '김영원', '박홍현', '손영호', '나평렬', '주현우', '김기환', '이서연', '최유진', '정하늘']
  const companies = ['(주)대공', '세기산업ENG', '무진아이', '부원이엔티', '대한산업보건']
  const statuses = ['입실', '퇴실', '대기', '발급', '반납']
  return names.map((visitorName, i) => {
    const day = String(5 + (i % 10)).padStart(2, '0')
    const issued = `2026-10-${day}T09:${String(10 + i).padStart(2, '0')}:00`
    const returned = i % 3 === 1 ? `2026-10-${day}T17:${String(10 + i).padStart(2, '0')}:00` : null
    return {
      id: i + 1,
      cardNo: String(500 + i),
      cardName: `만현방문증${String(i + 1).padStart(3, '0')}`,
      visitorName,
      phone: `010-${3000 + i}-${4000 + i}`,
      company: companies[i % companies.length],
      vehicle: i % 2 === 0 ? `${20 + i}나${2000 + i}` : '',
      purpose: i % 2 === 0 ? '회의참석 및 업무협의' : '설비점검',
      place: '본관 경비실',
      visitType: i % 2 === 0 ? '정기출입' : '단기근로',
      visitStart: `2026-10-${day}`,
      visitEnd: `2026-11-${day}`,
      host: '김담당',
      hostPhone: '010-9947-0209',
      applicationId: `demo-app-${i + 1}`,
      status: statuses[i % statuses.length],
      issuedAt: issued,
      returnedAt: returned,
    }
  })
}

function defaultAccessLogs(): AccessLogRow[] {
  const names = ['이휴갑', '미건원', '김우현', '박서준', '최유진', '정민호', '강하늘', '윤지우', '장도윤', '임수빈', '한예슬', '오세진']
  const logs: AccessLogRow[] = []
  let id = 1
  for (let d = 1; d <= 10; d++) {
    const day = String(d).padStart(2, '0')
    const count = 3 + (d % 4)
    for (let i = 0; i < count; i++) {
      const name = names[(d + i) % names.length]
      logs.push({
        id: id++,
        visitorName: name,
        cardNo: String(500 + i),
        cardName: `만현방문증${String(((d + i) % 10) + 1).padStart(3, '0')}`,
        direction: i % 2 === 0 ? '입장' : '퇴장',
        loggedAt: `2026-10-${day}T${String(8 + i).padStart(2, '0')}:${String(10 + i * 3).padStart(2, '0')}:00`,
        issuedAt: `2026-10-${day}T08:00:00`,
        returnedAt: i % 2 === 1 ? `2026-10-${day}T17:00:00` : '',
        visitType: i % 2 === 0 ? '정기출입' : '단기근로',
        company: '(방문)외부업체',
        title: '사원',
        host: '정문 스태프',
      })
    }
  }
  return logs
}

function migrate(b: Bundle): Bundle {
  b.users = (b.users || []).map((u) => normalizeUser(u))
  b.codes = (b.codes || []).map((c) => normalizeCode(c))
  if (!b[DEMO_FLAG]) {
    const existing = new Set(b.users.map((u) => u.username))
    const demos = buildDemoUsers(b.nextIds.users || 100)
      .filter((u) => !existing.has(u.username))
      .map((u, i) => ({ ...u, id: (b.nextIds.users || 100) + i }))
    b.users.push(...demos)
    b.nextIds.users = Math.max(b.nextIds.users || 1, ...b.users.map((u) => u.id)) + 1
    b[DEMO_FLAG] = true
  }
  const storedSeedVersion = b.codesSeedVersion ?? 0
  if (!b[CODES_FLAG] || storedSeedVersion < BUNDLED_CODES_SEED_VERSION) {
    applyCodesSeedToBundle(b, adminCodesSeed as CodesSeedFile)
  }
  if ((b.visitCards?.length ?? 0) < 8 || !b.visitCards?.[0]?.cardName) {
    b.visitCards = defaultVisitCards()
    b.nextIds.visitCards = defaultVisitCards().length + 1
  }
  if ((b.accessLogs?.length ?? 0) < 20 || !b.accessLogs?.[0]?.cardName) {
    b.accessLogs = defaultAccessLogs()
    b.nextIds.accessLogs = defaultAccessLogs().length + 1
  }
  if (!(b.departments?.[0] && 'parentId' in b.departments[0])) {
    b.departments = [
      { id: 1, code: '1000', name: '관리소', parentId: null, section: '', rank: 1, active: true },
      { id: 2, code: '1001', name: '경영지원', parentId: 1, section: '본사', rank: 1, active: true },
      { id: 3, code: '1002', name: '생산1팀', parentId: 1, section: '공장', rank: 2, active: true },
      { id: 4, code: '1003', name: '생산1팀 A조', parentId: 3, section: '공장', rank: 1, active: true },
      { id: 5, code: '1004', name: '생산1팀 B조', parentId: 3, section: '공장', rank: 2, active: true },
      { id: 6, code: '1005', name: '품질관리', parentId: 1, section: '공장', rank: 3, active: true },
      { id: 7, code: '1006', name: '안전환경', parentId: 1, section: '공장', rank: 4, active: true },
      { id: 8, code: '1007', name: '시설관리', parentId: 1, section: '공장', rank: 5, active: true },
      { id: 9, code: '1008', name: '총무팀', parentId: 2, section: '본사', rank: 1, active: true },
      { id: 10, code: '1009', name: '인사팀', parentId: 2, section: '본사', rank: 2, active: true },
      { id: 11, code: '1010', name: '보안팀', parentId: 1, section: '공장', rank: 6, active: true },
      { id: 12, code: '1011', name: '물류팀', parentId: 1, section: '공장', rank: 7, active: true },
      { id: 13, code: '1012', name: 'IT지원', parentId: 2, section: '본사', rank: 3, active: true },
      { id: 14, code: '1013', name: '정비반', parentId: 8, section: '공장', rank: 1, active: true },
      { id: 15, code: '1014', name: '구매팀', parentId: 2, section: '본사', rank: 4, active: true },
    ]
    b.nextIds.departments = 16
  }
  return b
}

function read(): Bundle {
  if (typeof window === 'undefined') return defaultBundle()
  const raw = window.localStorage.getItem(KEY)
  if (!raw) {
    const b = defaultBundle()
    window.localStorage.setItem(KEY, JSON.stringify(b))
    return b
  }
  try {
    const b = migrate(JSON.parse(raw) as Bundle)
    write(b)
    return b
  } catch {
    return defaultBundle()
  }
}

function write(b: Bundle) {
  window.localStorage.setItem(KEY, JSON.stringify(b))
}

export const localAdmin = {
  listUsers: () => read().users,
  createUser: (row: Omit<UserRow, 'id'>) => {
    const b = read()
    const user = normalizeUser({ ...row, id: b.nextIds.users++ })
    b.users.push(user)
    write(b)
    return user
  },
  updateUser: (id: number, patch: Partial<UserRow>) => {
    const b = read()
    const i = b.users.findIndex((u) => u.id === id)
    if (i < 0) return null
    b.users[i] = normalizeUser({ ...b.users[i], ...patch, id })
    write(b)
    return b.users[i]
  },
  deleteUser: (id: number) => {
    const b = read()
    b.users = b.users.filter((u) => u.id !== id)
    write(b)
  },
  resetPassword: (id: number) => {
    const b = read()
    const i = b.users.findIndex((u) => u.id === id)
    if (i < 0) return null
    b.users[i] = { ...b.users[i], password: USER_PASSWORD_RESET }
    write(b)
    return b.users[i]
  },
  listGroups: () => read().groups,
  createGroup: (row: GroupRow) => {
    const b = read()
    b.groups.push(row)
    write(b)
    return row
  },
  updateGroup: (code: string, name: string) => {
    const b = read()
    const g = b.groups.find((x) => x.code === code)
    if (!g) return null
    g.name = name
    write(b)
    return g
  },
  deleteGroup: (code: string) => {
    const b = read()
    b.groups = b.groups.filter((g) => g.code !== code)
    b.permissions = b.permissions.filter((p) => p.groupCode !== code)
    write(b)
  },
  listPermissions: (groupCode: string) => read().permissions.filter((p) => p.groupCode === groupCode),
  savePermissions: (groupCode: string, items: { id: number; allowed: boolean }[]) => {
    const b = read()
    for (const item of items) {
      const p = b.permissions.find((x) => x.id === item.id && x.groupCode === groupCode)
      if (p) p.allowed = item.allowed
    }
    write(b)
  },
  listDepartments: () => read().departments,
  createDepartment: (row: Omit<DeptRow, 'id'>) => {
    const b = read()
    const d = { ...row, id: b.nextIds.departments++ }
    b.departments.push(d)
    write(b)
    return d
  },
  updateDepartment: (id: number, patch: Partial<DeptRow>) => {
    const b = read()
    const i = b.departments.findIndex((d) => d.id === id)
    if (i < 0) return null
    b.departments[i] = { ...b.departments[i], ...patch, id }
    write(b)
    return b.departments[i]
  },
  deleteDepartment: (id: number) => {
    const b = read()
    b.departments = b.departments.filter((d) => d.id !== id)
    write(b)
  },
  listCodes: () => read().codes,
  createCode: (row: Omit<CodeRow, 'id'>) => {
    const b = read()
    const c = normalizeCode({ ...row, id: b.nextIds.codes++ })
    b.codes.push(c)
    write(b)
    return c
  },
  updateCode: (id: number, patch: Partial<CodeRow>) => {
    const b = read()
    const i = b.codes.findIndex((c) => c.id === id)
    if (i < 0) return null
    b.codes[i] = normalizeCode({ ...b.codes[i], ...patch, id })
    write(b)
    return b.codes[i]
  },
  listCodesByCategory: (category: string) => read().codes.filter((c) => c.category === category),
  deleteCode: (id: number) => {
    const b = read()
    b.codes = b.codes.filter((c) => c.id !== id)
    write(b)
  },
  /** 현재 브라우저 기초코드를 배포 시드 JSON 형태로 만든다 */
  exportCodesSeed: (): CodesSeedFile => {
    const b = read()
    const codes = b.codes.map(({ id: _id, ...rest }) => rest)
    const nextVersion = Math.max(BUNDLED_CODES_SEED_VERSION, b.codesSeedVersion ?? 0) + 1
    return { seedVersion: nextVersion, codes }
  },
  /** 시드 JSON을 현재 브라우저 localStorage에 적용한다 */
  importCodesSeed: (seed: CodesSeedFile) => {
    if (!seed?.codes?.length) throw new Error('시드에 코드가 없습니다.')
    const b = read()
    applyCodesSeedToBundle(b, {
      ...seed,
      // 번들 시드보다 낮으면 다음 migrate에서 덮어쓰이므로 최소 버전을 보장
      seedVersion: Math.max(Number(seed.seedVersion) || 0, BUNDLED_CODES_SEED_VERSION),
    })
    write(b)
  },
  codesSeedVersion: () => read().codesSeedVersion ?? 0,
  listVisitCards: () => read().visitCards,
  createVisitCard: (row: Omit<VisitCardRow, 'id'>) => {
    const b = read()
    const c = { ...row, id: b.nextIds.visitCards++ }
    b.visitCards.push(c)
    write(b)
    return c
  },
  updateVisitCard: (id: number, patch: Partial<VisitCardRow>) => {
    const b = read()
    const i = b.visitCards.findIndex((c) => c.id === id)
    if (i < 0) return null
    b.visitCards[i] = { ...b.visitCards[i], ...patch, id }
    write(b)
    return b.visitCards[i]
  },
  deleteVisitCard: (id: number) => {
    const b = read()
    b.visitCards = b.visitCards.filter((c) => c.id !== id)
    write(b)
  },
  listAccessLogs: () => read().accessLogs,
  createAccessLog: (row: Omit<AccessLogRow, 'id'>) => {
    const b = read()
    const c = { ...row, id: b.nextIds.accessLogs++ }
    b.accessLogs.unshift(c)
    write(b)
    return c
  },
  deleteAccessLog: (id: number) => {
    const b = read()
    b.accessLogs = b.accessLogs.filter((c) => c.id !== id)
    write(b)
  },
}
