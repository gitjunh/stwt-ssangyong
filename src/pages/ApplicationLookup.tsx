import { FormEvent, useState } from 'react'
import { Link } from 'react-router-dom'
import ApprovalQrPanel from '../components/ApprovalQrPanel'
import { useVisitorThemeClass } from '../hooks/useDarkMode'
import { lookupApplications, type VisitApplication } from '../store/applications'
import { findQrNotices, qrCodeForApplication } from '../store/qrNotices'

function isApprovedStatus(status: VisitApplication['status']): boolean {
  return status === '승인' || status === '완료'
}

export default function ApplicationLookup() {
  const themeClass = useVisitorThemeClass()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [results, setResults] = useState<VisitApplication[] | null>(null)

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    setResults(lookupApplications(name, phone))
  }

  const approved =
    results
      ?.filter((item) => isApprovedStatus(item.status))
      .filter((item, index, all) => all.findIndex((row) => row.id === item.id) === index) ?? []

  return (
    <main className={`lookup-page ${themeClass}`}>
      <header className="site-header">
        <p className="brand">쌍용 만현마을</p>
        <Link to="/">메인으로 돌아가기</Link>
      </header>
      <h1>신청 조회</h1>
      <form className="lookup-form" onSubmit={onSubmit}>
        <label>
          성명
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          휴대전화
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </label>
        <button type="submit">조회</button>
      </form>
      {results && (
        <section className="lookup-results" aria-live="polite">
          {document.documentElement.dataset.viewport === 'mobile' ? (
            <h2>모바일 신청 조회 결과</h2>
          ) : null}
          {results.length === 0 ? (
            <p>조회 결과가 없습니다.</p>
          ) : (
            <ul>
              {results.map((item) => (
                <li key={item.id}>
                  <span>{item.name}</span>
                  <span className={`status status-${item.status}`}>{item.status}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
      {approved.map((item) => {
        const notice = findQrNotices(item.name, item.phone).find((n) => n.applicationId === item.id)
        return (
          <ApprovalQrPanel
            key={item.id}
            applicationId={item.id}
            name={item.name}
            phone={item.phone}
            code={notice?.code ?? qrCodeForApplication(item.id)}
            message={notice?.message}
          />
        )
      })}
    </main>
  )
}
