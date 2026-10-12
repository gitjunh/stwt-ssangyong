import { FormEvent, useMemo, useState } from 'react'
import AdminColumnFilters, { filterRows } from '../../components/AdminColumnFilters'
import AdminGridToolbar from '../../components/AdminGridToolbar'
import AdminShell from '../../components/AdminShell'
import { downloadVisitCardsExcel } from '../../lib/excelExport'
import { localAdmin, type VisitCardRow } from '../../store/adminEntities'

type Mode = 'issue' | 'history'

const ISSUE_FILTERS = [
  { key: 'company', label: '방문업체' },
  { key: 'visitorName', label: '방문자' },
  { key: 'phone', label: '전화번호' },
  { key: 'vehicle', label: '차량번호' },
  { key: 'purpose', label: '방문목적' },
  { key: 'place', label: '장소' },
  { key: 'visitType', label: '방문유형' },
  { key: 'cardName', label: '카드이름' },
  { key: 'issuedAt', label: '발급일시' },
  { key: 'returnedAt', label: '반납일시' },
  { key: 'status', label: '상태' },
  { key: 'period', label: '방문기간' },
  { key: 'host', label: '찾아갈 분' },
  { key: 'hostPhone', label: '전화번호' },
]

export default function VisitCardsPage({ mode = 'issue' }: { mode?: Mode }) {
  const title = mode === 'history' ? '방문카드 발급/반납 조회' : '방문카드 발급/반납'
  return (
    <AdminShell title={title}>
      <VisitCardsContent mode={mode} title={title} />
    </AdminShell>
  )
}

function VisitCardsContent({ mode, title }: { mode: Mode; title: string }) {
  const [rows, setRows] = useState<VisitCardRow[]>(() => localAdmin.listVisitCards())
  const [filters, setFilters] = useState<Record<string, string>>({})
  const [statusQ, setStatusQ] = useState('')
  const [barcode, setBarcode] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [searched, setSearched] = useState(rows)

  function refresh() {
    const next = localAdmin.listVisitCards()
    setRows(next)
    setSearched(next)
  }

  function onSearch(e: FormEvent) {
    e.preventDefault()
    setSearched(
      rows.filter((row) => {
        if (mode === 'issue') {
          if (statusQ && !row.status.includes(statusQ)) return false
          if (barcode && !(row.cardNo.includes(barcode) || (row.cardName || '').includes(barcode))) return false
        } else {
          const day = (row.visitStart || row.issuedAt || '').slice(0, 10)
          if (from && day < from) return false
          if (to && day > to) return false
        }
        return true
      }),
    )
  }

  const filtered = useMemo(
    () =>
      filterRows(searched, filters, {
        company: (r) => r.company ?? '',
        visitorName: (r) => r.visitorName,
        phone: (r) => r.phone ?? '',
        vehicle: (r) => r.vehicle ?? '',
        purpose: (r) => r.purpose ?? '',
        place: (r) => r.place ?? '',
        visitType: (r) => r.visitType ?? '',
        cardName: (r) => r.cardName || r.cardNo,
        issuedAt: (r) => r.issuedAt ?? '',
        returnedAt: (r) => r.returnedAt ?? '',
        status: (r) => r.status,
        period: (r) => `${r.visitStart ?? ''} ~ ${r.visitEnd ?? ''}`,
        host: (r) => r.host ?? '',
        hostPhone: (r) => r.hostPhone ?? '',
      }),
    [searched, filters],
  )

  function issueOrReturn(row: VisitCardRow) {
    if (row.status === '발급' || row.status === '입실' || row.status === '대기') {
      localAdmin.updateVisitCard(row.id, {
        status: '반납',
        returnedAt: new Date().toISOString(),
      })
    } else {
      localAdmin.updateVisitCard(row.id, {
        status: '발급',
        issuedAt: new Date().toISOString(),
        returnedAt: null,
      })
    }
    refresh()
  }

  return (
    <>
      <h1>{title}</h1>
      <form className="search-form admin-search-bar" onSubmit={onSearch} aria-label="검색조건">
        <span className="search-label">검색조건</span>
        {mode === 'issue' ? (
          <>
            <label>
              상태
              <input value={statusQ} onChange={(e) => setStatusQ(e.target.value)} />
            </label>
            <label>
              바코드 스캔
              <input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
            </label>
          </>
        ) : (
          <div className="date-range-field">
            <span>방문일</span>
            <input
              type="date"
              aria-label="방문일 시작"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <span aria-hidden="true">~</span>
            <input
              type="date"
              aria-label="방문일 종료"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        )}
        <button type="submit">검색</button>
      </form>
      <AdminGridToolbar
        onExcel={() => downloadVisitCardsExcel(filtered)}
        onRefresh={refresh}
        onResetColumns={() => setFilters({})}
      />
      <p className="grid-group-hint">그룹화 할 열 머리글을 여기로 끌어옵니다.</p>
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              {mode === 'issue' ? <th scope="col">처리</th> : null}
              <th scope="col">방문업체</th>
              {mode === 'history' ? <th scope="col">직급</th> : null}
              <th scope="col">방문자</th>
              <th scope="col">전화번호</th>
              {mode === 'issue' ? <th scope="col">차량번호</th> : null}
              <th scope="col">방문목적</th>
              <th scope="col">장소</th>
              <th scope="col">방문유형</th>
              <th scope="col">카드이름</th>
              <th scope="col">발급일시</th>
              <th scope="col">반납일시</th>
              <th scope="col">상태</th>
              <th scope="col">방문기간</th>
              <th scope="col">찾아갈 분</th>
              <th scope="col">전화번호</th>
            </tr>
            <AdminColumnFilters
              defs={
                mode === 'issue'
                  ? ISSUE_FILTERS
                  : [
                      { key: 'company', label: '방문업체' },
                      { key: 'title', label: '직급' },
                      { key: 'visitorName', label: '방문자' },
                      { key: 'phone', label: '전화번호' },
                      { key: 'purpose', label: '방문목적' },
                      { key: 'place', label: '장소' },
                      { key: 'visitType', label: '방문유형' },
                      { key: 'cardName', label: '카드이름' },
                      { key: 'issuedAt', label: '발급일시' },
                      { key: 'returnedAt', label: '반납일시' },
                      { key: 'status', label: '상태' },
                      { key: 'period', label: '방문기간' },
                      { key: 'host', label: '찾아갈 분' },
                      { key: 'hostPhone', label: '전화번호' },
                    ]
              }
              values={filters}
              onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
              leadingEmpty={mode === 'issue'}
            />
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                {mode === 'issue' ? (
                  <td>
                    <button type="button" className="card-action-btn" onClick={() => issueOrReturn(row)}>
                      {row.status === '반납' || row.status === '퇴실' ? '발급' : '반납'}
                    </button>
                  </td>
                ) : null}
                <td>{row.company || '-'}</td>
                {mode === 'history' ? <td>-</td> : null}
                <td>{row.visitorName}</td>
                <td>{row.phone || '-'}</td>
                {mode === 'issue' ? <td>{row.vehicle || '-'}</td> : null}
                <td>{row.purpose || '-'}</td>
                <td>{row.place || '-'}</td>
                <td>{row.visitType || '-'}</td>
                <td>{row.cardName || row.cardNo}</td>
                <td>{row.issuedAt || '-'}</td>
                <td>{row.returnedAt || '-'}</td>
                <td className={`card-status card-status-${row.status}`}>{row.status}</td>
                <td>
                  {row.visitStart || '-'} ~ {row.visitEnd || '-'}
                </td>
                <td>{row.host || '-'}</td>
                <td>{row.hostPhone || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="grid-page-info">페이지 1 of 1 ({filtered.length}건)</p>
    </>
  )
}
