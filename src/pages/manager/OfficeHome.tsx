import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import AdminShell from '../../components/AdminShell'
import { kpiSummary, listApplications } from '../../store/applications'
import { communityStore } from '../../store/community'

function OfficeHomeContent() {
  const kpi = useMemo(() => kpiSummary(), [])
  const logs = useMemo(() => listApplications().slice(0, 8), [])
  const notices = communityStore.list()

  return (
    <>
      <h1 className="sr-only">관리소 현황</h1>
      <section className="office-kpi" aria-label="오늘 요약">
        <article>
          <p>대기</p>
          <strong>{kpi.waiting}</strong>
        </article>
        <article>
          <p>승인</p>
          <strong>{kpi.approved}</strong>
        </article>
        <article>
          <p>반려</p>
          <strong>{kpi.rejected}</strong>
        </article>
        <article>
          <p>차량 대기</p>
          <strong>{kpi.vehicleWaiting}</strong>
        </article>
      </section>
      <nav className="office-quick-links" aria-label="바로가기">
        <Link to="/manager/approvals">방문·차량 승인</Link>
        <Link to="/manager/residents">입주자 명부</Link>
        <Link to="/manager/community">커뮤니티 공지</Link>
      </nav>
      <h2>최근 신청·출입</h2>
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              <th>방문자</th>
              <th>동·호</th>
              <th>게이트</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>
                  {row.dong}동 {row.ho}호
                </td>
                <td>{row.gateType ?? '-'}</td>
                <td>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>공지</h2>
      <ul>
        {notices.map((n) => (
          <li key={n.id}>{n.title}</li>
        ))}
      </ul>
    </>
  )
}

export default function OfficeHome() {
  return (
    <AdminShell title="관리소 현황">
      <OfficeHomeContent />
    </AdminShell>
  )
}
