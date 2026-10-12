import { useCallback, useState } from 'react'

export function useAppToast() {
  const [message, setMessage] = useState<string | null>(null)

  const showToast = useCallback((text: string) => {
    setMessage(text)
  }, [])

  const clearToast = useCallback(() => {
    setMessage(null)
  }, [])

  return { message, showToast, clearToast }
}
