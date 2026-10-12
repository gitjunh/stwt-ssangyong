import type { ReactNode } from 'react'

type Props = {
  onExcel?: () => void
  onRefresh?: () => void
  onResetColumns?: () => void
  extra?: ReactNode
}

export default function AdminGridToolbar({ onExcel, onRefresh, onResetColumns, extra }: Props) {
  return (
    <div className="admin-toolbar admin-grid-toolbar">
      {onExcel ? (
        <button type="button" onClick={onExcel}>
          엑셀출력
        </button>
      ) : null}
      {onRefresh ? (
        <button type="button" onClick={onRefresh}>
          새로고침
        </button>
      ) : null}
      {onResetColumns ? (
        <button type="button" onClick={onResetColumns}>
          컬럼 초기화
        </button>
      ) : null}
      {extra}
    </div>
  )
}
