import { Link } from 'react-router-dom'
import WizardFooter from '../components/WizardFooter'
import { useVisitorThemeClass } from '../hooks/useDarkMode'

export default function ApplicationComplete() {
  const themeClass = useVisitorThemeClass()
  const isMobile = document.documentElement.dataset.viewport === 'mobile'

  return (
    <main className={`wizard-page ${themeClass}`}>
      <h1>신청 완료</h1>
      <p>신청이 접수되었습니다. 담당자 승인 후 안내가 제공됩니다.</p>
      {isMobile ? <p>모바일에서 신청이 완료되었습니다.</p> : null}
      <ul className="complete-notes">
        <li>승인 시 QR 안내를 확인하세요.</li>
        <li>방문 당일 신분증과 등록 차량번호를 준비하세요.</li>
        <li>QR 공유 금지 · 일정 변경은 담당자 문의</li>
      </ul>
      <nav className="wizard-actions consent-bottom" aria-label="완료 후 이동">
        <Link to="/" className="btn-secondary">
          메인으로
        </Link>
        <Link to="/lookup" className="btn-primary">
          신청 조회
        </Link>
      </nav>
      <WizardFooter />
    </main>
  )
}
