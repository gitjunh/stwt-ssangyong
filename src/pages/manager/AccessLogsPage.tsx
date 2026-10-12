import { useMemo } from 'react'
import AdminShell from '../../components/AdminShell'
import { listApplications } from '../../store/applications'

function AccessLogsContent() {
  const rows = useMemo(() => listApplications(), [])
  return (
    <>
      <h1 className="sr-only">출입 로그</h1>
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              <th>방문자</th>
              <th>연락처</th>
              <th>동·호</th>
              <th>게이트</th>
              <th>상태</th>
              <th>방문일</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{row.phone}</td>
                <td>
                  {row.dong}동 {row.ho}호
                </td>
                <td>{row.gateType ?? '-'}</td>
                <td>{row.status}</td>
                <td>{row.visitStart ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function AccessLogsPage() {
  return (
    <AdminShell title="출입 로그">
      <AccessLogsContent />
    </AdminShell>
  )
}
