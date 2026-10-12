export type ApplicationStatus = '대기' | '승인' | '반려' | '신청' | '완료'
export type GateType = '차량게이트' | '동현관' | '보행'

export type VisitApplication = {
  id: string
  name: string
  phone: string
  status: ApplicationStatus
  company?: string
  title?: string
  visitorKind?: '일반' | '업무'
  visitAt?: string
  visitStart?: string
  visitEnd?: string
  visitType?: string
  purpose?: string
  place?: string
  dong?: string
  ho?: string
  host?: string
  hostId?: string
  hostPhone?: string
  vehicle?: string
  gateType?: GateType
  vehicleStatus?: '대기' | '승인' | '반려'
  lobbyStatus?: '대기' | '승인' | '반려'
  facePhotoName?: string
}

const STORAGE_KEY = 'ssangyong-applications'
const DEMO_FLAG_KEY = 'ssangyong-applications-demo-v1'

function buildDemoApps(): VisitApplication[] {
  return [
    {
      id: 'app-demo-1',
      name: '방문객김',
      phone: '01099998888',
      status: '대기',
      dong: '101',
      ho: '1201',
      host: '김입주',
      hostId: 'r1',
      purpose: '친척 방문',
      place: '101동 1201호',
      gateType: '차량게이트',
      vehicle: '12가3456',
      vehicleStatus: '대기',
      lobbyStatus: '대기',
      visitStart: '2026-10-20',
      visitEnd: '2026-10-20',
      visitAt: '2026-10-20T10:00',
      visitType: '방문(일반)',
    },
    {
      id: 'app-demo-2',
      name: '방문객이',
      phone: '01088887777',
      status: '대기',
      dong: '101',
      ho: '1503',
      host: '이입주',
      hostId: 'r2',
      purpose: '택배',
      place: '101동 현관',
      gateType: '동현관',
      lobbyStatus: '대기',
      visitStart: '2026-10-21',
      visitEnd: '2026-10-21',
      visitAt: '2026-10-21T14:00',
      visitType: '방문(일반)',
    },
  ]
}

function readAll(): VisitApplication[] {
  if (typeof window === 'undefined') return buildDemoApps()
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    const seed = buildDemoApps()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    window.localStorage.setItem(DEMO_FLAG_KEY, '1')
    return seed
  }
  try {
    return JSON.parse(raw) as VisitApplication[]
  } catch {
    return buildDemoApps()
  }
}

function writeAll(rows: VisitApplication[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
}

export function listApplications(): VisitApplication[] {
  return readAll()
}

export function saveApplication(app: VisitApplication): VisitApplication {
  const all = readAll()
  const i = all.findIndex((a) => a.id === app.id)
  if (i >= 0) all[i] = app
  else all.unshift(app)
  writeAll(all)
  return app
}

export function updateApplicationStatus(id: string, status: ApplicationStatus): VisitApplication | null {
  const all = readAll()
  const i = all.findIndex((a) => a.id === id)
  if (i < 0) return null
  all[i] = { ...all[i], status }
  if (status === '승인') {
    if (all[i].gateType === '차량게이트') all[i].vehicleStatus = '승인'
    if (all[i].gateType === '동현관') all[i].lobbyStatus = '승인'
  }
  if (status === '반려') {
    all[i].vehicleStatus = all[i].vehicleStatus === '대기' ? '반려' : all[i].vehicleStatus
    all[i].lobbyStatus = all[i].lobbyStatus === '대기' ? '반려' : all[i].lobbyStatus
  }
  writeAll(all)
  return all[i]
}

export function updateLobbyStatus(id: string, lobbyStatus: '승인' | '반려'): VisitApplication | null {
  const all = readAll()
  const i = all.findIndex((a) => a.id === id)
  if (i < 0) return null
  all[i] = {
    ...all[i],
    lobbyStatus,
    status: lobbyStatus === '승인' ? '승인' : lobbyStatus === '반려' ? '반려' : all[i].status,
  }
  writeAll(all)
  return all[i]
}

export function lookupApplications(name: string, phone: string): VisitApplication[] {
  const p = phone.replace(/\D/g, '')
  const n = name.trim()
  return readAll().filter((a) => {
    const phoneOk = a.phone.replace(/\D/g, '') === p
    const nameOk = !n || a.name.includes(n)
    return phoneOk && nameOk
  })
}

export function kpiSummary() {
  const all = readAll()
  return {
    waiting: all.filter((a) => a.status === '대기' || a.status === '신청').length,
    approved: all.filter((a) => a.status === '승인').length,
    rejected: all.filter((a) => a.status === '반려').length,
    vehicleWaiting: all.filter((a) => a.gateType === '차량게이트' && a.vehicleStatus === '대기').length,
  }
}
