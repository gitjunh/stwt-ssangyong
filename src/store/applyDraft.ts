import type { GateType } from './applications'

export type ApplyDraft = {
  host: string
  hostId: string
  dong: string
  ho: string
  locations: string[]
  purpose: string
  purposeOther: string
  visitType: string
  visitStart: string
  visitEnd: string
  gateType: GateType | ''
  visitorKind: '일반' | '업무'
  company: string
  title: string
  name: string
  phone: string
  email: string
  isForeigner: boolean
  vehicle: string
  facePhotoName: string
}

const STORAGE_KEY = 'ssangyong-apply-draft'

export const EMPTY_DRAFT: ApplyDraft = {
  host: '',
  hostId: '',
  dong: '',
  ho: '',
  locations: [],
  purpose: '',
  purposeOther: '',
  visitType: '방문(일반)',
  visitStart: '',
  visitEnd: '',
  gateType: '',
  visitorKind: '일반',
  company: '',
  title: '',
  name: '',
  phone: '',
  email: '',
  isForeigner: false,
  vehicle: '',
  facePhotoName: '',
}

export function readDraft(): ApplyDraft {
  if (typeof window === 'undefined') return { ...EMPTY_DRAFT }
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return { ...EMPTY_DRAFT }
  try {
    return { ...EMPTY_DRAFT, ...(JSON.parse(raw) as Partial<ApplyDraft>) }
  } catch {
    return { ...EMPTY_DRAFT }
  }
}

export function writeDraft(patch: Partial<ApplyDraft>): ApplyDraft {
  const next = { ...readDraft(), ...patch }
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export function clearDraft(): void {
  window.sessionStorage.removeItem(STORAGE_KEY)
}
