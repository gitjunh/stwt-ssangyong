import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { verifyAdminCredentials } from '../auth/adminAccounts'
import { setAdminSession } from '../auth/adminSession'

const REMEMBER_KEY = 'ssangyong-admin-remember-id'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(REMEMBER_KEY)
      if (saved) {
        setId(saved)
        setRemember(true)
      }
    } catch {
      /* ignore */
    }
  }, [])

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = id.trim()
    if (verifyAdminCredentials(trimmed, password)) {
      try {
        if (remember) window.localStorage.setItem(REMEMBER_KEY, trimmed)
        else window.localStorage.removeItem(REMEMBER_KEY)
      } catch {
        /* ignore */
      }
      setAdminSession(trimmed)
      navigate('/manager')
      return
    }
    setError('아이디 또는 비밀번호가 올바르지 않습니다.')
  }

  return (
    <main className="admin-login">
      <header className="site-header">
        <p className="brand">쌍용 만현마을</p>
        <p className="context">방문예약·관리</p>
        <Link to="/">방문 메인</Link>
      </header>
      <h1>관리 로그인</h1>
      <form className="lookup-form" onSubmit={onSubmit}>
        <label>
          ID
          <input
            name="adminId"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
          />
        </label>
        <label>
          PW
          <input
            name="adminPw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>
        <label className="remember-row">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            aria-label="Remember"
          />
          <span>Remember</span>
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">로그인</button>
      </form>
    </main>
  )
}
