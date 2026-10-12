import { Link } from 'react-router-dom'
import {
  IconLookup,
  IconStep1,
  IconStep2,
  IconStep3,
  IconStep4,
  IconVisitApply,
} from '../components/MainIcons'
import { useDarkMode } from '../hooks/useDarkMode'
import { communityStore } from '../store/community'

const ENTRY_STEPS = [
  { step: 1, label: '방문신청', details: ['동의', '동·호·차량'], Icon: IconStep1 },
  { step: 2, label: '출입승인', details: ['입주민·관리소', '차량·동현관'], Icon: IconStep2 },
  { step: 3, label: 'QR·안내', details: ['승인 후 조회'], Icon: IconStep3 },
  { step: 4, label: '게이트 통과', details: ['정문·동현관'], Icon: IconStep4 },
] as const

export default function VisitMain() {
  const { themeClass } = useDarkMode()
  const notices = communityStore.list().slice(0, 3)

  return (
    <main className={`visit-main apartment-main ${themeClass}`}>
      <header className="site-header visit-main-header">
        <p className="brand">쌍용 만현마을</p>
        <p className="context">스마트 방문출입</p>
      </header>

      <section className="hero apartment-hero" aria-label="주요 진입">
        <div className="apartment-hero-overlay" />
        <div className="apartment-hero-content">
          <p className="hero-partner">Powered by STWORLD</p>
          <h1 className="company-title">쌍용 만현마을</h1>
          <p className="welcome-line">구축 아파트도 공사 없이, 방문·차량·동현관 출입을 스마트하게.</p>
          <nav className="main-ctas" aria-label="주요 진입">
            <Link to="/apply/privacy" className="main-card">
              <IconVisitApply />
              <span className="main-card-label">방문신청</span>
            </Link>
            <Link to="/lookup" className="main-card">
              <IconLookup />
              <span className="main-card-label">신청 조회</span>
            </Link>
          </nav>
          <nav className="hero-secondary-links" aria-label="입주민·관리소">
            <Link to="/resident/login">입주민</Link>
            <Link to="/manager/login">관리소</Link>
          </nav>
        </div>
      </section>

      <section className="entry-steps" aria-label="방문자 출입절차">
        <ol className="step-list">
          {ENTRY_STEPS.map((item) => (
            <li key={item.step} className="step-item">
              <span className="step-number">STEP {item.step}</span>
              <item.Icon />
              <span className="step-label">{item.label}</span>
              {item.details.map((detail) => (
                <span key={detail} className="step-detail">
                  {detail}
                </span>
              ))}
            </li>
          ))}
        </ol>
      </section>

      <section className="stworld-subscribe" aria-label="STWORLD 구독 안내">
        <h2>STWORLD 월 구독형 단지 출입</h2>
        <p>
          자동차 출입 게이트 하드웨어와 관리소·입주자용 웹·앱을 STWORLD가 제공합니다. 대규모 공사 없이
          구독으로 현대식 방문·주차·동현관 승인을 운영합니다.
        </p>
      </section>

      <section className="community-preview" aria-label="단지 공지">
        <h2>단지 공지</h2>
        <ul>
          {notices.map((n) => (
            <li key={n.id}>
              <strong>{n.title}</strong>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
