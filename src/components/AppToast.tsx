import { useEffect } from 'react'

type Props = {
  message: string | null
  onClose: () => void
  durationMs?: number
}

/** 원본과 동일한 하단 주황 안내 배너 */
export default function AppToast({ message, onClose, durationMs = 2800 }: Props) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onClose, durationMs)
    return () => window.clearTimeout(timer)
  }, [message, durationMs, onClose])

  if (!message) return null

  return (
    <div className="app-toast" role="status" aria-live="assertive">
      {message}
    </div>
  )
}
