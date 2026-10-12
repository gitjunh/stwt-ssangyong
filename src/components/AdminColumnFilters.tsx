type FilterDef =
  | { key: string; label: string; kind?: 'text' }
  | { key: string; label: string; kind: 'select'; options: string[] }

type Props = {
  defs: FilterDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  leadingEmpty?: boolean
  trailingEmpty?: boolean
}

export function filterRows<T>(
  rows: T[],
  values: Record<string, string>,
  getters: Record<string, (row: T) => string>,
): T[] {
  return rows.filter((row) =>
    Object.entries(values).every(([key, needle]) => {
      if (!needle) return true
      const hay = (getters[key]?.(row) ?? '').toLowerCase()
      return hay.includes(needle.toLowerCase())
    }),
  )
}

export default function AdminColumnFilters({
  defs,
  values,
  onChange,
  leadingEmpty,
  trailingEmpty,
}: Props) {
  return (
    <tr className="table-filter-row">
      {leadingEmpty ? <th /> : null}
      {defs.map((def) => (
        <th key={def.key}>
          {def.kind === 'select' ? (
            <select
              aria-label={`${def.label} 필터`}
              value={values[def.key] ?? ''}
              onChange={(e) => onChange(def.key, e.target.value)}
            >
              <option value="">전체</option>
              {def.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              aria-label={`${def.label} 필터`}
              value={values[def.key] ?? ''}
              onChange={(e) => onChange(def.key, e.target.value)}
            />
          )}
        </th>
      ))}
      {trailingEmpty ? <th /> : null}
    </tr>
  )
}
