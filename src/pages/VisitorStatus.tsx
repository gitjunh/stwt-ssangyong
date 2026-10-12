import { FormEvent, useMemo, useState } from 'react'
import AdminColumnFilters, { filterRows } from '../components/AdminColumnFilters'
import AdminGridToolbar from '../components/AdminGridToolbar'
import AdminShell from '../components/AdminShell'
import { downloadApplicationsExcel } from '../lib/excelExport'
import { listApplications, type VisitApplication } from '../store/applications'
import { getDefaultLinkMessage, recordLinkSend } from '../store/linkSends'

const FILTER_DEFS = [
  { key: 'company', label: '방문업체' },
  { key: 'title', label: '직급' },
  { key: 'name', label: '방문자' },
  { key: 'phone', label: '휴대전화' },
  { key: 'vehicle', label: '차량번호' },
  { key: 'visitType', label: '방문유형' },
  { key: 'purpose', label: '방문목적' },
  { key: 'place', label: '장소' },
  { key: 'visitStart', label: '방문 시작' },
  { key: 'visitEnd', label: '방문 종료' },
  { key: 'host', label: '찾아갈 분' },
  { key: 'status', label: '진행상태' },
  { key: 'approval', label: '승인' },
  { key: 'memo', label: '승인메모' },
  { key: 'cardName', label: '카드이름' },
  { key: 'issuedAt', label: '발급일' },
]

function inRange(day: string | undefined, from: string, to: string): boolean {
  if (!day) return false
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

export default function VisitorStatus() {
  return (
    <AdminShell title="방문자 현황">
      <VisitorStatusContent />
    </AdminShell>
  )
}

function VisitorStatusContent() {
  const [allRows, setAllRows] = useState(() => listApplications())
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [statusQ, setStatusQ] = useState('')
  const [searched, setSearched] = useState<VisitApplication[]>(allRows)
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkPhone, setLinkPhone] = useState('')
  const [linkMessage, setLinkMessage] = useState(getDefaultLinkMessage())
  const [linkSuccess, setLinkSuccess] = useState(false)

  function refresh() {
    const next = listApplications()
    setAllRows(next)
    setSearched(next)
  }

  function onSearch(event: FormEvent) {
    event.preventDefault()
    setSearched(
      allRows.filter((row) => {
        const day = row.visitStart || row.visitAt?.slice(0, 10)
        if ((from || to) && !inRange(day, from, to)) return false
        if (statusQ && !row.status.includes(statusQ)) return false
        return true
      }),
    )
  }

  const filtered = useMemo(
    () =>
      filterRows(searched, filters, {
        company: (r) => r.company ?? '',
        title: (r) => r.title ?? '',
        name: (r) => r.name,
        phone: (r) => r.phone,
        vehicle: (r) => r.vehicle ?? '',
        visitType: (r) => r.visitType ?? '',
        purpose: (r) => r.purpose ?? '',
        place: (r) => r.place ?? '',
        visitStart: (r) => r.visitStart ?? '',
        visitEnd: (r) => r.visitEnd ?? '',
        host: (r) => r.host ?? '',
        status: (r) => r.status,
        approval: (r) => (r.status === '승인' || r.status === '완료' ? '승인' : r.status),
        memo: (r) => r.approvalMemo ?? '',
        cardName: (r) => r.cardName ?? '',
        issuedAt: (r) => r.issuedAt ?? '',
      }),
    [searched, filters],
  )

  function onSendLink(event: FormEvent) {
    event.preventDefault()
    recordLinkSend(linkPhone, linkMessage)
    setLinkSuccess(true)
  }

  return (
    <>
      <h1>방문자 현황</h1>
      <form className="search-form admin-search-bar" onSubmit={onSearch} aria-label="검색조건">
        <span className="search-label">검색조건</span>
        <div className="date-range-field">
          <span>방문일</span>
          <input
            type="date"
            aria-label="방문일 시작"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <span>~</span>
          <input
            type="date"
            aria-label="방문일 종료"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </div>
        <label>
          상태
          <input value={statusQ} onChange={(e) => setStatusQ(e.target.value)} />
        </label>
        <button type="submit">검색</button>
      </form>
      <AdminGridToolbar
        onExcel={() => downloadApplicationsExcel(filtered)}
        onRefresh={refresh}
        onResetColumns={() => setFilters({})}
        extra={
          <button
            type="button"
            className="link-send-btn"
            onClick={() => {
              setLinkOpen(true)
              setLinkSuccess(false)
            }}
          >
            방문신청 링크 보내기
          </button>
        }
      />
      <p className="grid-group-hint">그룹화 할 열 머리글을 여기로 끌어오십시오.</p>
      {linkOpen ? (
        <section className="link-send-panel" aria-label="방문신청 링크 보내기">
          <h2>방문신청 링크 보내기</h2>
          <p>실SMS는 발송하지 않으며, 로컬에만 기록됩니다.</p>
          <form className="lookup-form" onSubmit={onSendLink}>
            <label>
              수신 전화번호
              <input
                type="tel"
                value={linkPhone}
                onChange={(e) => setLinkPhone(e.target.value)}
                required
              />
            </label>
            <label>
              메시지
              <textarea value={linkMessage} onChange={(e) => setLinkMessage(e.target.value)} rows={3} />
            </label>
            <button type="submit">전송</button>
            <button type="button" onClick={() => setLinkOpen(false)}>
              닫기
            </button>
          </form>
          {linkSuccess ? <p role="status">전송 성공 (로컬 기록)</p> : null}
        </section>
      ) : null}
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              <th scope="col">방문업체</th>
              <th scope="col">직급</th>
              <th scope="col">방문자</th>
              <th scope="col">휴대전화</th>
              <th scope="col">차량번호</th>
              <th scope="col">방문유형</th>
              <th scope="col">방문목적</th>
              <th scope="col">장소</th>
              <th scope="col">방문시작일</th>
              <th scope="col">방문종료일</th>
              <th scope="col">찾아갈 분</th>
              <th scope="col">진행상태</th>
              <th scope="col">승인</th>
              <th scope="col">승인메모</th>
              <th scope="col">카드이름</th>
              <th scope="col">발급일</th>
            </tr>
            <AdminColumnFilters
              defs={FILTER_DEFS}
              values={filters}
              onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
            />
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.company ?? '-'}</td>
                <td>{row.title || '-'}</td>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>{row.vehicle || '-'}</td>
                <td>{row.visitType ?? '-'}</td>
                <td>{row.purpose ?? '-'}</td>
                <td>{row.place ?? '-'}</td>
                <td>{row.visitStart || '-'}</td>
                <td>{row.visitEnd || '-'}</td>
                <td>{row.host ?? '-'}</td>
                <td>{row.status}</td>
                <td>{row.status === '승인' || row.status === '완료' ? '승인' : '-'}</td>
                <td>{row.approvalMemo || '-'}</td>
                <td>{row.cardName || '-'}</td>
                <td>{row.issuedAt?.slice(0, 10) || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="grid-page-info">페이지 1 of 1 ({filtered.length}건)</p>
    </>
  )
}
