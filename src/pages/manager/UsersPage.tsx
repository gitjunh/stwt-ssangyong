import { FormEvent, useEffect, useMemo, useState } from 'react'
import AdminShell from '../../components/AdminShell'
import AppToast from '../../components/AppToast'
import { useAppToast } from '../../hooks/useAppToast'
import AdminGridToolbar from '../../components/AdminGridToolbar'
import { downloadUsersExcel } from '../../lib/excelExport'
import {
  localAdmin,
  USER_DEPARTMENTS,
  USER_LOCATION_FIXED,
  USER_PASSWORD_RESET,
  USER_ROLES,
  type UserRow,
} from '../../store/adminEntities'

type Filters = {
  username: string
  name: string
  nameEn: string
  department: string
  landline: string
  mobile: string
  email: string
  location: string
  role: string
  active: '' | 'Y' | 'N'
}

const emptyFilters: Filters = {
  username: '',
  name: '',
  nameEn: '',
  department: '',
  landline: '',
  mobile: '',
  email: '',
  location: '',
  role: '',
  active: '',
}

type FormState = {
  username: string
  name: string
  nameEn: string
  department: string
  landline: string
  mobile: string
  email: string
  location: string
  role: string
  active: boolean
}

const emptyForm: FormState = {
  username: '',
  name: '',
  nameEn: '',
  department: USER_DEPARTMENTS[0],
  landline: '',
  mobile: '',
  email: '',
  location: USER_LOCATION_FIXED,
  role: '담당자',
  active: true,
}

function matches(row: UserRow, f: Filters): boolean {
  const has = (hay: string, needle: string) => !needle || hay.toLowerCase().includes(needle.toLowerCase())
  if (!has(row.username, f.username)) return false
  if (!has(row.name, f.name)) return false
  if (!has(row.nameEn, f.nameEn)) return false
  if (f.department && row.department !== f.department) return false
  if (!has(row.landline, f.landline)) return false
  if (!has(row.mobile, f.mobile)) return false
  if (!has(row.email, f.email)) return false
  if (f.location && row.location !== f.location) return false
  if (!has(row.role, f.role)) return false
  if (f.active === 'Y' && !row.active) return false
  if (f.active === 'N' && row.active) return false
  return true
}

export default function UsersPage() {
  return (
    <AdminShell title="사용자 관리">
      <UsersContent />
    </AdminShell>
  )
}

function UsersContent() {
  const { message, showToast, clearToast } = useAppToast()
  const [rows, setRows] = useState<UserRow[]>([])
  const [filters, setFilters] = useState<Filters>(emptyFilters)
  const [editing, setEditing] = useState<UserRow | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)

  function refresh() {
    setRows(localAdmin.listUsers())
  }

  useEffect(() => {
    refresh()
  }, [])

  const filtered = useMemo(() => rows.filter((r) => matches(r, filters)), [rows, filters])

  const locations = useMemo(() => {
    const set = new Set(rows.map((r) => r.location).filter(Boolean))
    set.add(USER_LOCATION_FIXED)
    return [...set]
  }, [rows])

  function openNew() {
    setEditing(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(row: UserRow) {
    setEditing(row)
    setForm({
      username: row.username,
      name: row.name,
      nameEn: row.nameEn,
      department: row.department,
      landline: row.landline,
      mobile: row.mobile,
      email: row.email,
      location: row.location || USER_LOCATION_FIXED,
      role: row.role,
      active: row.active,
    })
    setFormOpen(true)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const payload = {
      username: form.username.trim(),
      name: form.name.trim(),
      nameEn: form.nameEn.trim(),
      department: form.department,
      landline: form.landline.trim(),
      mobile: form.mobile.trim(),
      email: form.email.trim(),
      location: form.location || USER_LOCATION_FIXED,
      role: form.role,
      active: form.active,
      password: editing?.password || USER_PASSWORD_RESET,
      groupCode:
        form.role === '관리자'
          ? '1001'
          : form.role === '담당자'
            ? '1002'
            : form.role === '결재자'
              ? '1003'
              : '1004',
      departmentId: USER_DEPARTMENTS.indexOf(form.department as (typeof USER_DEPARTMENTS)[number]) + 1 || 1,
    }
    if (editing) {
      localAdmin.updateUser(editing.id, payload)
      showToast('사용자 정보가 수정되었습니다.')
    } else {
      localAdmin.createUser(payload)
      showToast('사용자가 등록되었습니다.')
    }
    setFormOpen(false)
    setEditing(null)
    setForm(emptyForm)
    refresh()
  }

  function onDelete(id: number) {
    if (!window.confirm('이 사용자를 삭제하시겠습니까?')) return
    localAdmin.deleteUser(id)
    showToast('사용자가 삭제되었습니다.')
    refresh()
  }

  function onResetPassword(id: number) {
    localAdmin.resetPassword(id)
    showToast(`비밀번호가 초기화되었습니다. (${USER_PASSWORD_RESET})`)
    refresh()
  }

  return (
    <>
      <h1>사용자 리스트</h1>
      <AdminGridToolbar
        onExcel={() => downloadUsersExcel(filtered)}
        onRefresh={refresh}
        onResetColumns={() => setFilters(emptyFilters)}
      />

      {formOpen ? (
        <form className="admin-crud-form" onSubmit={onSubmit} aria-label="사용자 편집">
          <label>
            사용자ID
            <input
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
            />
          </label>
          <label>
            사용자명
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label>
            사용자명(영문)
            <input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
          </label>
          <label>
            부서
            <select
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            >
              {USER_DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <label>
            유선번호
            <input value={form.landline} onChange={(e) => setForm((f) => ({ ...f, landline: e.target.value }))} />
          </label>
          <label>
            핸드폰
            <input value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value }))} />
          </label>
          <label>
            이메일
            <input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </label>
          <label>
            소재지
            <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </label>
          <label>
            사용권한
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
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
        <table className="visitor-table user-list-table">
          <thead>
            <tr>
              <th scope="col">
                <button type="button" className="table-link-btn" onClick={openNew}>
                  신규
                </button>
              </th>
              <th scope="col">사용자ID</th>
              <th scope="col">사용자명</th>
              <th scope="col">사용자명(영문)</th>
              <th scope="col">부서</th>
              <th scope="col">유선번호</th>
              <th scope="col">핸드폰</th>
              <th scope="col">이메일</th>
              <th scope="col">소재지</th>
              <th scope="col">사용권한</th>
              <th scope="col">사용여부</th>
              <th scope="col">#</th>
            </tr>
            <tr className="table-filter-row">
              <th />
              <th>
                <input
                  aria-label="사용자ID 필터"
                  value={filters.username}
                  onChange={(e) => setFilters((f) => ({ ...f, username: e.target.value }))}
                />
              </th>
              <th>
                <input
                  aria-label="사용자명 필터"
                  value={filters.name}
                  onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
                />
              </th>
              <th>
                <input
                  aria-label="사용자명(영문) 필터"
                  value={filters.nameEn}
                  onChange={(e) => setFilters((f) => ({ ...f, nameEn: e.target.value }))}
                />
              </th>
              <th>
                <select
                  aria-label="부서 필터"
                  value={filters.department}
                  onChange={(e) => setFilters((f) => ({ ...f, department: e.target.value }))}
                >
                  <option value="">전체</option>
                  {USER_DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <input
                  aria-label="유선번호 필터"
                  value={filters.landline}
                  onChange={(e) => setFilters((f) => ({ ...f, landline: e.target.value }))}
                />
              </th>
              <th>
                <input
                  aria-label="핸드폰 필터"
                  value={filters.mobile}
                  onChange={(e) => setFilters((f) => ({ ...f, mobile: e.target.value }))}
                />
              </th>
              <th>
                <input
                  aria-label="이메일 필터"
                  value={filters.email}
                  onChange={(e) => setFilters((f) => ({ ...f, email: e.target.value }))}
                />
              </th>
              <th>
                <select
                  aria-label="소재지 필터"
                  value={filters.location}
                  onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
                >
                  <option value="">전체</option>
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </th>
              <th>
                <input
                  aria-label="사용권한 필터"
                  value={filters.role}
                  onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
                />
              </th>
              <th>
                <select
                  aria-label="사용여부 필터"
                  value={filters.active}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, active: e.target.value as Filters['active'] }))
                  }
                >
                  <option value="">전체</option>
                  <option value="Y">사용</option>
                  <option value="N">미사용</option>
                </select>
              </th>
              <th />
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id}>
                <td>
                  <button type="button" className="table-link-btn" onClick={() => openEdit(row)}>
                    수정
                  </button>
                  <button type="button" className="table-link-btn" onClick={() => onDelete(row.id)}>
                    삭제
                  </button>
                </td>
                <td>{row.username}</td>
                <td>{row.name}</td>
                <td>{row.nameEn || ''}</td>
                <td>{row.department}</td>
                <td>{row.landline || ''}</td>
                <td>{row.mobile || ''}</td>
                <td>{row.email || ''}</td>
                <td>{row.location}</td>
                <td>{row.role}</td>
                <td>{row.active ? '✓' : ''}</td>
                <td>
                  <button type="button" className="reset-pw-btn" onClick={() => onResetPassword(row.id)}>
                    비밀번호초기화
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AppToast message={message} onClose={clearToast} />
    </>
  )
}
