import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function WizardFooter() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <footer className="wizard-footer">
      <Link to="/" className="wizard-footer-home" aria-label="홈">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-8.5z"
          />
        </svg>
      </Link>
      <button
        type="button"
        className="wizard-footer-menu"
        aria-label="메뉴"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
          <path fill="currentColor" d="M4 7h16v2H4V7zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
      </button>
      {menuOpen ? (
        <nav className="wizard-footer-panel" aria-label="간단 메뉴">
          <Link to="/" onClick={() => setMenuOpen(false)}>
            메인
          </Link>
          <Link to="/lookup" onClick={() => setMenuOpen(false)}>
            신청 조회
          </Link>
        </nav>
      ) : null}
    </footer>
  )
}
