import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react'
import AdminShell from '../../components/AdminShell'
import {
  CODE_VISIT_AREAS,
  CODE_VISIT_TYPES,
  localAdmin,
  type CodeRow,
} from '../../store/adminEntities'

type PanelKey = 'LOCATION' | 'PURPOSE' | 'VISIT_CARD' | 'DEVICE'

type FormState = {
  code: string
  name: string
  nameEn: string
  sortOrder: number
  active: boolean
  area: string
  visitType: string
}

const emptyForm = (category: PanelKey): FormState => ({
  code: '',
  name: '',
  nameEn: '',
  sortOrder: 1,
  active: true,
  area: category === 'LOCATION' ? CODE_VISIT_AREAS[0] : '',
  visitType: category === 'VISIT_CARD' ? CODE_VISIT_TYPES[0] : '',
})

export default function CodesPage() {
  return (
    <AdminShell title="기초코드 관리">
      <CodesContent />
    </AdminShell>
  )
}

function CodesContent() {
  const [rows, setRows] = useState<CodeRow[]>([])
  const [areaFilter, setAreaFilter] = useState<string>(CODE_VISIT_AREAS[0])
  const [editing, setEditing] = useState<{ category: PanelKey; row: CodeRow | null } | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm('LOCATION'))

  function refresh() {
    setRows(localAdmin.listCodes())
  }

  useEffect(() => {
    refresh()
  }, [])

  const byCategory = useMemo(() => {
    const map: Record<PanelKey, CodeRow[]> = {
      LOCATION: [],
      PURPOSE: [],
      VISIT_CARD: [],
      DEVICE: [],
    }
    for (const row of rows) {
      if (row.category in map) map[row.category as PanelKey].push(row)
    }
    for (const key of Object.keys(map) as PanelKey[]) {
      map[key].sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
    }
    return map
  }, [rows])

  const locations = useMemo(
    () => byCategory.LOCATION.filter((r) => !areaFilter || r.area === areaFilter),
    [byCategory.LOCATION, areaFilter],
  )

  function openNew(category: PanelKey) {
    setEditing({ category, row: null })
    setForm(emptyForm(category))
  }

  function openEdit(category: PanelKey, row: CodeRow) {
    setEditing({ category, row })
    setForm({
      code: row.code,
      name: row.name,
      nameEn: row.nameEn,
      sortOrder: row.sortOrder,
      active: row.active,
      area: row.area || CODE_VISIT_AREAS[0],
      visitType: row.visitType || CODE_VISIT_TYPES[0],
    })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!editing) return
    const { category, row } = editing
    const payload: Omit<CodeRow, 'id'> = {
      category,
      code: form.code.trim(),
      name: form.name.trim(),
      nameEn: form.nameEn.trim(),
      sortOrder: Number(form.sortOrder) || 0,
      active: form.active,
      area: category === 'LOCATION' ? form.area : undefined,
      visitType: category === 'VISIT_CARD' ? form.visitType : undefined,
    }
    if (row) localAdmin.updateCode(row.id, payload)
    else localAdmin.createCode(payload)
    setEditing(null)
    refresh()
  }

  function onDelete(id: number) {
    if (!window.confirm('이 코드를 삭제하시겠습니까?')) return
    localAdmin.deleteCode(id)
    refresh()
  }

  return (
    <>
      <h1 className="sr-only">기초코드 관리</h1>
      {editing ? (
        <form className="admin-crud-form" onSubmit={onSubmit} aria-label="기초코드 편집">
          <label>
            코드
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
          </label>
          <label>
            명칭
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          {editing.category !== 'VISIT_CARD' ? (
            <label>
              명칭(영문)
              <input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
            </label>
          ) : null}
          {editing.category === 'LOCATION' ? (
            <label>
              방문지역
              <select value={form.area} onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}>
                {CODE_VISIT_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {editing.category === 'VISIT_CARD' ? (
            <label>
              방문유형
              <select
                value={form.visitType}
                onChange={(e) => setForm((f) => ({ ...f, visitType: e.target.value }))}
              >
                {CODE_VISIT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {editing.category !== 'VISIT_CARD' ? (
            <label>
              정렬순서
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </label>
          ) : null}
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
          <button type="submit">{editing.row ? '수정 저장' : '등록'}</button>
          <button type="button" className="admin-btn-muted" onClick={() => setEditing(null)}>
            취소
          </button>
        </form>
      ) : null}

      <div className="codes-grid">
        <CodePanel
          title="방문 장소"
          toolbar={
            <label className="codes-area-filter">
              방문지역
              <select
                aria-label="방문지역"
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
              >
                {CODE_VISIT_AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </label>
          }
          onNew={() => openNew('LOCATION')}
          headers={['장소코드', '장소명', '장소명(영문)', '정렬순서', '사용여부']}
          rows={locations}
          renderCells={(row) => [
            row.code,
            row.name,
            row.nameEn,
            String(row.sortOrder),
            row.active ? '✓' : '',
          ]}
          onEdit={(row) => openEdit('LOCATION', row)}
          onDelete={onDelete}
        />
        <CodePanel
          title="방문 목적"
          onNew={() => openNew('PURPOSE')}
          headers={['항목코드', '항목명', '항목명(영문)', '정렬순서', '사용여부']}
          rows={byCategory.PURPOSE}
          renderCells={(row) => [
            row.code,
            row.name,
            row.nameEn,
            String(row.sortOrder),
            row.active ? '✓' : '',
          ]}
          onEdit={(row) => openEdit('PURPOSE', row)}
          onDelete={onDelete}
        />
        <CodePanel
          title="방문 카드"
          onNew={() => openNew('VISIT_CARD')}
          headers={['카드번호', '카드이름', '방문유형', '사용여부']}
          rows={byCategory.VISIT_CARD}
          renderCells={(row) => [row.code, row.name, row.visitType || '', row.active ? '✓' : '']}
          onEdit={(row) => openEdit('VISIT_CARD', row)}
          onDelete={onDelete}
        />
        <CodePanel
          title="전자 기기"
          onNew={() => openNew('DEVICE')}
          headers={['항목코드', '항목명', '항목명(영문)', '정렬순서', '사용여부']}
          rows={byCategory.DEVICE}
          renderCells={(row) => [
            row.code,
            row.name,
            row.nameEn,
            String(row.sortOrder),
            row.active ? '✓' : '',
          ]}
          onEdit={(row) => openEdit('DEVICE', row)}
          onDelete={onDelete}
        />
      </div>
    </>
  )
}

function CodePanel({
  title,
  toolbar,
  onNew,
  headers,
  rows,
  renderCells,
  onEdit,
  onDelete,
}: {
  title: string
  toolbar?: ReactNode
  onNew: () => void
  headers: string[]
  rows: CodeRow[]
  renderCells: (row: CodeRow) => string[]
  onEdit: (row: CodeRow) => void
  onDelete: (id: number) => void
}) {
  return (
    <section className="codes-panel" aria-label={title}>
      <div className="codes-panel-head">
        <h2>{title}</h2>
        <div className="codes-panel-actions">
          {toolbar}
          <button type="button" className="codes-new-btn" onClick={onNew}>
            신규
          </button>
        </div>
      </div>
      <div className="visitor-table-wrap codes-table-wrap">
        <table className="visitor-table codes-table">
          <thead>
            <tr>
              <th scope="col" />
              {headers.map((h) => (
                <th key={h} scope="col">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <button type="button" className="codes-edit-btn" onClick={() => onEdit(row)}>
                    수정
                  </button>
                  <button type="button" className="codes-del-btn" onClick={() => onDelete(row.id)}>
                    삭제
                  </button>
                </td>
                {renderCells(row).map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
