import { FormEvent, useEffect, useMemo, useState } from 'react'
import AdminGridToolbar from '../../components/AdminGridToolbar'
import AdminShell from '../../components/AdminShell'
import { localAdmin, type DeptRow } from '../../store/adminEntities'

export default function DepartmentsPage() {
  return (
    <AdminShell title="부서 관리">
      <DepartmentsContent />
    </AdminShell>
  )
}

function depthOf(row: DeptRow, byId: Map<number, DeptRow>): number {
  let d = 0
  let cur: DeptRow | undefined = row
  const seen = new Set<number>()
  while (cur?.parentId != null && !seen.has(cur.id)) {
    seen.add(cur.id)
    d += 1
    cur = byId.get(cur.parentId)
  }
  return d
}

function DepartmentsContent() {
  const [rows, setRows] = useState<DeptRow[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [editing, setEditing] = useState<DeptRow | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState({
    code: '',
    name: '',
    parentId: '' as string,
    section: '',
    rank: 1,
    active: true,
  })

  function refresh() {
    setRows(localAdmin.listDepartments())
  }

  useEffect(() => {
    refresh()
  }, [])

  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r])), [rows])
  const ordered = useMemo(() => {
    const children = new Map<number | null, DeptRow[]>()
    for (const r of rows) {
      const p = r.parentId ?? null
      if (!children.has(p)) children.set(p, [])
      children.get(p)!.push(r)
    }
    for (const list of children.values()) list.sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0) || a.id - b.id)
    const out: DeptRow[] = []
    function walk(parent: number | null) {
      for (const c of children.get(parent) || []) {
        out.push(c)
        walk(c.id)
      }
    }
    walk(null)
    return out
  }, [rows])

  function openNew() {
    setEditing(null)
    setForm({
      code: '',
      name: '',
      parentId: selectedId != null ? String(selectedId) : '',
      section: '',
      rank: 1,
      active: true,
    })
    setFormOpen(true)
  }

  function openEdit() {
    const row = rows.find((r) => r.id === selectedId)
    if (!row) return
    setEditing(row)
    setForm({
      code: row.code,
      name: row.name,
      parentId: row.parentId != null ? String(row.parentId) : '',
      section: row.section || '',
      rank: row.rank ?? 1,
      active: row.active ?? true,
    })
    setFormOpen(true)
  }

  function onDelete() {
    if (selectedId == null) return
    if (!window.confirm('선택한 부서를 삭제하시겠습니까?')) return
    localAdmin.deleteDepartment(selectedId)
    setSelectedId(null)
    refresh()
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      parentId: form.parentId ? Number(form.parentId) : null,
      section: form.section.trim(),
      rank: Number(form.rank) || 0,
      active: form.active,
    }
    if (editing) localAdmin.updateDepartment(editing.id, payload)
    else localAdmin.createDepartment(payload)
    setFormOpen(false)
    refresh()
  }

  return (
    <>
      <h1>부서 리스트</h1>
      <AdminGridToolbar
        onRefresh={refresh}
        extra={
          <>
            <button type="button" onClick={openNew}>
              신규
            </button>
            <button type="button" onClick={openEdit} disabled={selectedId == null}>
              수정
            </button>
            <button type="button" onClick={onDelete} disabled={selectedId == null}>
              삭제
            </button>
          </>
        }
      />
      {formOpen ? (
        <form className="admin-crud-form" onSubmit={onSubmit} aria-label="부서 편집">
          <label>
            부서코드
            <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} required />
          </label>
          <label>
            부서명
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label>
            상위부서
            <select value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
              <option value="">없음</option>
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.code} {r.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            섹션
            <input value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))} />
          </label>
          <label>
            순위
            <input
              type="number"
              value={form.rank}
              onChange={(e) => setForm((f) => ({ ...f, rank: Number(e.target.value) }))}
            />
          </label>
          <label>
            사용여부
            <select
              value={form.active ? 'Y' : 'N'}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.value === 'Y' }))}
            >
              <option value="Y">사용</option>
              <option value="N">미사용</option>
            </select>
          </label>
          <button type="submit">{editing ? '수정 저장' : '등록'}</button>
          <button type="button" className="admin-btn-muted" onClick={() => setFormOpen(false)}>
            취소
          </button>
        </form>
      ) : null}
      <div className="visitor-table-wrap">
        <table className="visitor-table admin-data-grid">
          <thead>
            <tr>
              <th scope="col">부서코드</th>
              <th scope="col">부서명</th>
              <th scope="col">섹션</th>
              <th scope="col">순위</th>
              <th scope="col">사용여부</th>
            </tr>
          </thead>
          <tbody>
            {ordered.map((row) => {
              const depth = depthOf(row, byId)
              return (
                <tr
                  key={row.id}
                  className={selectedId === row.id ? 'is-selected' : undefined}
                  onClick={() => setSelectedId(row.id)}
                >
                  <td style={{ paddingLeft: `${0.75 + depth * 1.1}rem` }}>{row.code}</td>
                  <td>{row.name}</td>
                  <td>{row.section || ''}</td>
                  <td>{row.rank ?? ''}</td>
                  <td>{row.active === false ? '' : '✓'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
