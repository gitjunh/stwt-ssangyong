import { FormEvent, useEffect, useState } from 'react'
import AdminGridToolbar from '../../components/AdminGridToolbar'
import AdminShell from '../../components/AdminShell'
import { localAdmin, type GroupRow, type PermissionRow } from '../../store/adminEntities'

export default function PermissionGroupsPage() {
  return (
    <AdminShell title="권한그룹 관리">
      <PermissionGroupsContent />
    </AdminShell>
  )
}

function PermissionGroupsContent() {
  const [groups, setGroups] = useState<GroupRow[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [perms, setPerms] = useState<PermissionRow[]>([])
  const [editing, setEditing] = useState<GroupRow | null>(null)
  const [form, setForm] = useState({ code: '', name: '' })

  function refreshGroups() {
    const list = localAdmin.listGroups()
    setGroups(list)
    if (!selected && list[0]) setSelected(list[0].code)
    return list
  }

  function refreshPerms(code: string) {
    setPerms(localAdmin.listPermissions(code))
  }

  useEffect(() => {
    refreshGroups()
  }, [])

  useEffect(() => {
    if (selected) refreshPerms(selected)
  }, [selected])

  function onSaveGroup(e: FormEvent) {
    e.preventDefault()
    if (editing) {
      localAdmin.updateGroup(editing.code, form.name)
    } else {
      localAdmin.createGroup({ code: form.code, name: form.name })
    }
    setEditing(null)
    setForm({ code: '', name: '' })
    refreshGroups()
  }

  function onDeleteGroup(code: string) {
    localAdmin.deleteGroup(code)
    if (selected === code) setSelected(null)
    refreshGroups()
  }

  function togglePerm(id: number) {
    setPerms((prev) => prev.map((p) => (p.id === id ? { ...p, allowed: !p.allowed } : p)))
  }

  function onSavePerms() {
    if (!selected) return
    const items = perms.map((p) => ({ id: p.id, allowed: p.allowed }))
    localAdmin.savePermissions(selected, items)
    refreshPerms(selected)
  }

  return (
    <>
      <h1>권한그룹 관리</h1>
      <AdminGridToolbar
        onRefresh={() => {
          void refreshGroups()
          if (selected) refreshPerms(selected)
        }}
      />
      <div className="admin-split">
        <section className="admin-pane" aria-label="권한그룹">
          <div className="admin-pane-head">
            <h2>권한그룹</h2>
            <button
              type="button"
              onClick={() => {
                setEditing(null)
                setForm({ code: '', name: '' })
              }}
            >
              신규
            </button>
          </div>
          <form className="admin-crud-form compact" onSubmit={onSaveGroup}>
            <label>
              그룹코드
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                disabled={Boolean(editing)}
                required
              />
            </label>
            <label>
              그룹명
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </label>
            <button type="submit">{editing ? '수정 저장' : '등록'}</button>
          </form>
          <div className="visitor-table-wrap">
            <table className="visitor-table">
              <thead>
                <tr>
                  <th>처리</th>
                  <th>그룹코드</th>
                  <th>그룹명</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((g) => (
                  <tr
                    key={g.code}
                    className={selected === g.code ? 'is-selected' : undefined}
                    onClick={() => setSelected(g.code)}
                  >
                    <td>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditing(g)
                          setForm({ code: g.code, name: g.name })
                        }}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onDeleteGroup(g.code)
                        }}
                      >
                        삭제
                      </button>
                    </td>
                    <td>{g.code}</td>
                    <td>{g.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-pane" aria-label="권한 목록">
          <div className="admin-pane-head">
            <h2>권한 목록</h2>
            <button type="button" onClick={() => onSavePerms()} disabled={!selected}>
              저장
            </button>
          </div>
          <div className="visitor-table-wrap">
            <table className="visitor-table">
              <thead>
                <tr>
                  <th>메뉴명</th>
                  <th>권한명</th>
                  <th>권한여부</th>
                </tr>
              </thead>
              <tbody>
                {perms.map((p) => (
                  <tr key={p.id}>
                    <td>{p.menuName}</td>
                    <td>{p.permissionName}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={p.allowed}
                        onChange={() => togglePerm(p.id)}
                        aria-label={`${p.menuName} ${p.permissionName}`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  )
}
