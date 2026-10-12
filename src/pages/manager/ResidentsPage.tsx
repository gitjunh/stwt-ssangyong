import { FormEvent, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import { residentsStore, type Resident } from '../../store/residents'

function ResidentsContent() {
  const [rows, setRows] = useState(() => residentsStore.list())
  const [form, setForm] = useState({ name: '', phone: '', dong: '', ho: '' })

  function refresh() {
    setRows(residentsStore.list())
  }

  function onAdd(e: FormEvent) {
    e.preventDefault()
    const phone = form.phone.trim()
    const row: Resident = {
      id: `r-${Date.now()}`,
      loginId: phone,
      name: form.name.trim(),
      phone,
      dong: form.dong.trim(),
      ho: form.ho.trim(),
      active: true,
      password: '1234',
    }
    residentsStore.upsert(row)
    setForm({ name: '', phone: '', dong: '', ho: '' })
    refresh()
  }

  return (
    <>
      <h1 className="sr-only">입주자 명부</h1>
      <form className="admin-crud-form" onSubmit={onAdd} aria-label="입주자 등록">
        <label>
          성명
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        </label>
        <label>
          휴대전화
          <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} required />
        </label>
        <label>
          동
          <input value={form.dong} onChange={(e) => setForm((f) => ({ ...f, dong: e.target.value }))} required />
        </label>
        <label>
          호수
          <input value={form.ho} onChange={(e) => setForm((f) => ({ ...f, ho: e.target.value }))} required />
        </label>
        <button type="submit">등록</button>
      </form>
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              <th scope="col">성명</th>
              <th scope="col">동</th>
              <th scope="col">호수</th>
              <th scope="col">휴대전화</th>
              <th scope="col">활성</th>
              <th scope="col">처리</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.dong}</td>
                <td>{r.ho}</td>
                <td>{r.phone}</td>
                <td>{r.active ? '활성' : '비활성'}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => {
                      residentsStore.setActive(r.id, !r.active)
                      refresh()
                    }}
                  >
                    {r.active ? '비활성화' : '활성화'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default function ResidentsPage() {
  return (
    <AdminShell title="입주자 명부">
      <ResidentsContent />
    </AdminShell>
  )
}
