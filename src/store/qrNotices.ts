import { SECURITY_VISIT_MESSAGE, qrCodeFor } from '../lib/visitQr'

export type QrNotice = {
  applicationId: string
  name: string
  phone: string
  code: string
  message: string
  createdAt: string
}

const STORAGE_KEY = 'ssangyong-qr-notices'

export function qrCodeForApplication(applicationId: string): string {
  return qrCodeFor(applicationId)
}

function readAll(): QrNotice[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as QrNotice[]
  } catch {
    return []
  }
}

export function listQrNotices(): QrNotice[] {
  return readAll()
}

export function recordQrNotice(input: {
  applicationId: string
  name: string
  phone: string
}): QrNotice {
  const notice: QrNotice = {
    applicationId: input.applicationId,
    name: input.name,
    phone: input.phone,
    code: qrCodeFor(input.applicationId),
    message: SECURITY_VISIT_MESSAGE,
    createdAt: new Date().toISOString(),
  }
  const all = readAll().filter((item) => item.applicationId !== input.applicationId)
  all.unshift(notice)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  return notice
}

export function findQrNotices(name: string, phone: string): QrNotice[] {
  const normalizedPhone = phone.replace(/\D/g, '')
  return readAll().filter(
    (item) => item.name === name.trim() && item.phone.replace(/\D/g, '') === normalizedPhone,
  )
}
