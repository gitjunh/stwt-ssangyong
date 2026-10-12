import { useMemo, useState } from 'react'
import AdminColumnFilters, { filterRows } from '../components/AdminColumnFilters'
import AdminGridToolbar from '../components/AdminGridToolbar'
import AdminShell from '../components/AdminShell'
import { downloadVehiclesExcel } from '../lib/excelExport'
import {
  listVehicleApplications,
  periodLabel,
  updateVehicleStatus,
  type VisitApplication,
} from '../store/applications'

const FILTER_DEFS = [
  { key: 'company', label: '방문업체' },
  { key: 'title', label: '직급' },
  { key: 'name', label: '방문자' },
  { key: 'visitType', label: '방문유형' },
  { key: 'vehicle', label: '차량번호' },
  { key: 'purpose', label: '방문목적' },
  { key: 'place', label: '장소' },
  { key: 'period', label: '방문기간' },
  { key: 'host', label: '찾아갈 분' },
  { key: 'status', label: '방문승인' },
]

export default function VehicleApproval() {
  return (
    <AdminShell title="차량 승인">
      <VehicleApprovalContent />
    </AdminShell>
  )
}

function VehicleApprovalContent() {
  const [rows, setRows] = useState<VisitApplication[]>(() => listVehicleApplications())
  const [filters, setFilters] = useState<Record<string, string>>({})

  function refresh() {
    setRows(listVehicleApplications())
  }

  const filtered = useMemo(
    () =>
      filterRows(rows, filters, {
        company: (r) => r.company ?? '',
        title: (r) => r.title ?? '',
        name: (r) => r.name,
        visitType: (r) => r.visitType ?? '',
        vehicle: (r) => r.vehicle ?? '',
        purpose: (r) => r.purpose ?? '',
        place: (r) => r.place ?? '',
        period: (r) => periodLabel(r),
        host: (r) => r.host ?? '',
        status: (r) => r.status,
      }),
    [rows, filters],
  )

  function onApprove(id: string) {
    updateVehicleStatus(id, '승인')
    refresh()
  }

  function onReject(id: string) {
    updateVehicleStatus(id, '반려')
    refresh()
  }

  return (
    <>
      <h1>차량 승인</h1>
      <AdminGridToolbar
        onExcel={() => downloadVehiclesExcel(filtered)}
        onRefresh={refresh}
        onResetColumns={() => setFilters({})}
      />
      <p className="grid-group-hint">그룹화 할 열 머리글을 여기로 끌어옵니다.</p>
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              <th scope="col">방문업체</th>
              <th scope="col">직급</th>
              <th scope="col">방문자</th>
              <th scope="col">방문유형</th>
              <th scope="col">차량번호</th>
              <th scope="col">방문목적</th>
              <th scope="col">장소</th>
              <th scope="col">방문기간</th>
              <th scope="col">찾아갈 분</th>
              <th scope="col">방문승인</th>
              <th scope="col">처리</th>
            </tr>
            <AdminColumnFilters
              defs={FILTER_DEFS}
              values={filters}
              onChange={(k, v) => setFilters((f) => ({ ...f, [k]: v }))}
              trailingEmpty
            />
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>{row.company ?? '-'}</td>
                <td>{row.title || '-'}</td>
                <td>{row.name}</td>
                <td>{row.visitType ?? '-'}</td>
                <td className="vehicle-cell">{row.vehicle}</td>
                <td>{row.purpose ?? '-'}</td>
                <td>{row.place ?? '-'}</td>
                <td>{periodLabel(row)}</td>
                <td>{row.host ?? '-'}</td>
                <td>{row.status}</td>
                <td>
                  {row.vehicleStatus !== '승인' ? (
                    <>
                      <button type="button" className="approve-btn" onClick={() => onApprove(row.id)}>
                        차량 승인
                      </button>
                      <button type="button" className="reject-btn" onClick={() => onReject(row.id)}>
                        반려
                      </button>
                    </>
                  ) : (
                    '차량승인'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="grid-page-info">페이지 1 of 1 ({filtered.length}건)</p>
    </>
  )
}
