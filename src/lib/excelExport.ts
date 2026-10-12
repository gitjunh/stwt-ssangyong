import type { VisitApplication } from '../store/applications'
import { periodLabel } from '../store/applications'
import type { AccessLogRow, UserRow, VisitCardRow } from '../store/adminEntities'

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([`\uFEFF${csv}`], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export function applicationsToCsv(rows: VisitApplication[]): string {
  const header = [
    '방문업체',
    '직급',
    '방문자',
    '휴대전화',
    '차량번호',
    '방문유형',
    '방문목적',
    '장소',
    '방문시작일',
    '방문종료일',
    '찾아갈 분',
    '진행상태',
  ]
  const lines = rows.map((row) =>
    [
      row.company ?? '',
      row.title ?? '',
      row.name,
      row.phone,
      row.vehicle ?? '',
      row.visitType ?? '',
      row.purpose ?? '',
      row.place ?? '',
      row.visitStart ?? '',
      row.visitEnd ?? '',
      row.host ?? '',
      row.status,
    ]
      .map(escapeCsv)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

export function downloadApplicationsExcel(rows: VisitApplication[]): void {
  downloadCsv('ssangyong-visitors.xls', applicationsToCsv(rows))
}

export function downloadApprovalsExcel(rows: VisitApplication[]): void {
  const header = [
    '방문업체',
    '직급',
    '방문자',
    '방문유형',
    '방문목적',
    '장소',
    '방문기간',
    '찾아갈 분',
    '진행상태',
  ]
  const lines = rows.map((row) =>
    [
      row.company ?? '',
      row.title ?? '',
      row.name,
      row.visitType ?? '',
      row.purpose ?? '',
      row.place ?? '',
      periodLabel(row),
      row.host ?? '',
      row.status,
    ]
      .map(escapeCsv)
      .join(','),
  )
  downloadCsv('ssangyong-approvals.xls', [header.join(','), ...lines].join('\n'))
}

export function downloadVehiclesExcel(rows: VisitApplication[]): void {
  const header = [
    '방문업체',
    '직급',
    '방문자',
    '방문유형',
    '차량번호',
    '방문목적',
    '장소',
    '방문기간',
    '찾아갈 분',
    '방문승인',
  ]
  const lines = rows.map((row) =>
    [
      row.company ?? '',
      row.title ?? '',
      row.name,
      row.visitType ?? '',
      row.vehicle ?? '',
      row.purpose ?? '',
      row.place ?? '',
      periodLabel(row),
      row.host ?? '',
      row.status,
    ]
      .map(escapeCsv)
      .join(','),
  )
  downloadCsv('ssangyong-vehicles.xls', [header.join(','), ...lines].join('\n'))
}

export function usersToCsv(rows: UserRow[]): string {
  const header = [
    '사용자ID',
    '사용자명',
    '사용자명(영문)',
    '부서',
    '유선번호',
    '핸드폰',
    '이메일',
    '소재지',
    '사용권한',
    '사용여부',
  ]
  const lines = rows.map((row) =>
    [
      row.username,
      row.name,
      row.nameEn,
      row.department,
      row.landline,
      row.mobile,
      row.email,
      row.location,
      row.role,
      row.active ? 'Y' : 'N',
    ]
      .map(escapeCsv)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

export function downloadUsersExcel(rows: UserRow[]): void {
  downloadCsv('ssangyong-users.xls', usersToCsv(rows))
}

export function downloadVisitCardsExcel(rows: VisitCardRow[]): void {
  const header = [
    '방문업체',
    '방문자',
    '전화번호',
    '차량번호',
    '방문목적',
    '장소',
    '방문유형',
    '카드이름',
    '발급일시',
    '반납일시',
    '상태',
  ]
  const lines = rows.map((row) =>
    [
      row.company ?? '',
      row.visitorName,
      row.phone ?? '',
      row.vehicle ?? '',
      row.purpose ?? '',
      row.place ?? '',
      row.visitType ?? '',
      row.cardName || row.cardNo,
      row.issuedAt ?? '',
      row.returnedAt ?? '',
      row.status,
    ]
      .map(escapeCsv)
      .join(','),
  )
  downloadCsv('ssangyong-visit-cards.xls', [header.join(','), ...lines].join('\n'))
}

export function downloadAccessLogsExcel(rows: AccessLogRow[]): void {
  const header = [
    '인증일시',
    '발급일시',
    '반납일시',
    '카드이름',
    '방문유형',
    '방문업체',
    '직급',
    '방문자',
    '찾아갈분',
  ]
  const lines = rows.map((row) =>
    [
      row.loggedAt,
      row.issuedAt ?? '',
      row.returnedAt ?? '',
      row.cardName || row.cardNo || '',
      row.visitType ?? '',
      row.company ?? '',
      row.title ?? '',
      row.visitorName,
      row.host ?? '',
    ]
      .map(escapeCsv)
      .join(','),
  )
  downloadCsv('ssangyong-access-logs.xls', [header.join(','), ...lines].join('\n'))
}
