import { useMemo, useState } from 'react'
import AdminShell from '../components/AdminShell'
import {
  listApplications,
  updateApplicationStatus,
  type VisitApplication,
} from '../store/applications'
import { residentsStore } from '../store/residents'

function VisitApprovalContent() {
  const [rows, setRows] = useState(() => listApplications())
  const filtered = useMemo(
    () => rows.filter((r) => r.status === '대기' || r.status === '신청' || r.status === '승인'),
    [rows],
  )

  function refresh() {
    setRows(listApplications())
  }

  function onApprove(row: VisitApplication) {
    if (row.hostId && !residentsStore.canApproveVisits(row.hostId)) {
      window.alert('비활성 입주자 세대는 관리소에서도 방문 승인을 진행할 수 없습니다. 입주자를 활성화하세요.')
      return
    }
    updateApplicationStatus(row.id, '승인')
    refresh()
  }

  return (
    <>
      <h1 className="sr-only">방문·차량 승인</h1>
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              <th>방문자</th>
              <th>동·호</th>
              <th>입주민</th>
              <th>출입유형</th>
              <th>차량</th>
              <th>상태</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>
                  {row.dong}동 {row.ho}호
                </td>
                <td>{row.host}</td>
                <td>{row.gateType}</td>
                <td>{row.vehicle || '-'}</td>
                <td>{row.status}</td>
                <td>
                  {row.status === '대기' || row.status === '신청' ? (
                    <>
                      <button type="button" className="approve-btn" onClick={() => onApprove(row)}>
                        승인
                      </button>
                      <button
                        type="button"
                        className="reject-btn"
                        onClick={() => {
                          updateApplicationStatus(row.id, '반려')
                          refresh()
                        }}
                      >
                        반려
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function VisitApproval() {
  return (
    <AdminShell title="방문·차량 승인">
      <VisitApprovalContent />
    </AdminShell>
  )
}
