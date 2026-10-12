import { ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { clearAdminSession, getAdminSession, isAdminLoggedIn } from '../auth/adminSession'
import { ADMIN_MENU, titleForPath } from './adminMenu'

const MOBILE_MQ = '(max-width: 720px)'
const TAB_PREFIX = 'ssangyong-tab:'

type Props = {
  children: ReactNode
  title?: string
}

type TabItem = { to: string; label: string }

function allMenuItems(): TabItem[] {
  return ADMIN_MENU.flatMap((g) => g.items)
}

function labelFor(path: string, fallback: string): string {
  return allMenuItems().find((i) => i.to === path)?.label || fallback
}

function readStoredTabs(): string[] {
  const items = allMenuItems()
  const out: string[] = []
  for (const item of items) {
    try {
      if (sessionStorage.getItem(`${TAB_PREFIX}${item.to}`) === '1') out.push(item.to)
    } catch {
      /* ignore */
    }
  }
  return out
}

export default function AdminShell({ children, title }: Props) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/manager/login" replace />
  }

  return <AdminShellFrame title={title}>{children}</AdminShellFrame>
}

function AdminShellFrame({ children, title }: Props) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const session = getAdminSession()
  const pageTitle = title || titleForPath(pathname)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(ADMIN_MENU.map((g) => [g.id, true])),
  )
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  )
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_MQ).matches : false,
  )
  const [tabPaths, setTabPaths] = useState<string[]>(() => {
    const stored = typeof window !== 'undefined' ? readStoredTabs() : []
    return stored.includes(pathname) ? stored : [...stored, pathname]
  })

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = () => {
      setIsMobile(mq.matches)
      if (mq.matches) setSidebarCollapsed(true)
    }
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (isMobile) setSidebarCollapsed(true)
  }, [pathname, isMobile])

  useEffect(() => {
    setTabPaths((prev) => {
      if (prev.includes(pathname)) return prev
      return [...prev, pathname]
    })
    try {
      sessionStorage.setItem(`${TAB_PREFIX}${pathname}`, '1')
    } catch {
      /* ignore */
    }
  }, [pathname])

  const openTabs = useMemo(
    () => tabPaths.map((to) => ({ to, label: labelFor(to, pageTitle) })),
    [tabPaths, pageTitle],
  )

  function toggleGroup(id: string) {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function closeTab(to: string) {
    try {
      sessionStorage.removeItem(`${TAB_PREFIX}${to}`)
    } catch {
      /* ignore */
    }
    setTabPaths((prev) => {
      let next = prev.filter((p) => p !== to)
      if (next.length === 0) {
        next = ['/manager/visitors']
        try {
          sessionStorage.setItem(`${TAB_PREFIX}/manager/visitors`, '1')
        } catch {
          /* ignore */
        }
      }
      if (to === pathname) {
        navigate(next[next.length - 1])
      }
      return next
    })
  }

  function onLogout() {
    clearAdminSession()
    navigate('/manager/login', { replace: true })
  }

  const shellClass = [
    'admin-shell',
    sidebarCollapsed ? 'is-sidebar-collapsed' : '',
    isMobile ? 'is-mobile' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={shellClass}>
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button
            type="button"
            className="admin-hamburger"
            aria-label={sidebarCollapsed ? '사이드바 열기' : '사이드바 접기'}
            aria-expanded={!sidebarCollapsed}
            onClick={() => setSidebarCollapsed((v) => !v)}
          >
            ☰
          </button>
          <span className="admin-brand">쌍용 만현마을</span>
          <span className="admin-system-title">방문출입 관리</span>
        </div>
        <div className="admin-topbar-right">
          <span className="admin-user-label">{session?.id || '관리자'}</span>
          <button type="button" className="admin-logout" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      </header>

      <div className="admin-body">
        {!sidebarCollapsed && isMobile ? (
          <button
            type="button"
            className="admin-sidebar-backdrop"
            aria-label="메뉴 닫기"
            onClick={() => setSidebarCollapsed(true)}
          />
        ) : null}
        <aside className="admin-sidebar" aria-label="관리 메뉴">
          {ADMIN_MENU.map((group) => (
            <div key={group.id} className="admin-side-group">
              <button
                type="button"
                className="admin-side-group-btn"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={openGroups[group.id]}
              >
                <span>{group.label}</span>
                <span aria-hidden>{openGroups[group.id] ? '▾' : '▸'}</span>
              </button>
              {openGroups[group.id] ? (
                <ul className="admin-side-list">
                  {group.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        aria-current={pathname === item.to ? 'page' : undefined}
                        className={pathname === item.to ? 'is-active' : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </aside>

        <div className="admin-main">
          <div className="admin-tabs" role="tablist" aria-label="열린 메뉴">
            {openTabs.map((tab) => (
              <div
                key={tab.to}
                className={`admin-tab${tab.to === pathname ? ' is-active' : ''}`}
                role="tab"
                aria-selected={tab.to === pathname}
              >
                <button type="button" className="admin-tab-label" onClick={() => navigate(tab.to)}>
                  {tab.label}
                </button>
                <button
                  type="button"
                  className="admin-tab-close"
                  aria-label={`${tab.label} 닫기`}
                  onClick={(e) => {
                    e.stopPropagation()
                    closeTab(tab.to)
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="admin-content">{children}</div>
        </div>
      </div>
    </div>
  )
}
