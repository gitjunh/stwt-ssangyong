export type AdminMenuItem = { to: string; label: string }
export type AdminMenuGroup = { id: string; label: string; items: AdminMenuItem[] }

export const ADMIN_MENU: AdminMenuGroup[] = [
  {
    id: 'office',
    label: '관리소',
    items: [
      { to: '/manager', label: '현황 KPI' },
      { to: '/manager/residents', label: '입주자 명부' },
      { to: '/manager/approvals', label: '방문·차량 승인' },
      { to: '/manager/community', label: '커뮤니티 공지' },
      { to: '/manager/access-logs', label: '출입 로그' },
    ],
  },
]

export function titleForPath(pathname: string): string {
  for (const group of ADMIN_MENU) {
    for (const item of group.items) {
      if (item.to === pathname) return item.label
    }
  }
  return '관리소'
}
