import { Link, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/manager/approvals', label: '방문 승인' },
  { to: '/manager/vehicles', label: '차량 승인' },
  { to: '/manager/visitors', label: '방문자 현황' },
] as const

export default function AdminNav() {
  const { pathname } = useLocation()

  return (
    <nav className="admin-nav" aria-label="관리 메뉴">
      {LINKS.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          aria-current={pathname === link.to ? 'page' : undefined}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
