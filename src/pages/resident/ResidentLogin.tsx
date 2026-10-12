import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setResidentSession } from '../../auth/residentSession'
import { residentsStore } from '../../store/residents'

export default function ResidentLogin() {
  const navigate = useNavigate()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const r = residentsStore.findByLoginId(loginId)
    if (!r || r.password !== password) {
      setError('입주민 계정 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    if (!r.active) {
      setError('비활성 입주자는 로그인할 수 없습니다.')
      return
    }
    setResidentSession(r.id)
    navigate('/resident')
  }

  return (
    <main className="admin-login">
      <h1>입주민 로그인</h1>
      <p className="context">쌍용 만현마을 · 데모 아이디/비밀번호 1234</p>
      <form onSubmit={onSubmit}>
        <label>
          아이디
          <input aria-label="아이디" value={loginId} onChange={(e) => setLoginId(e.target.value)} />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            aria-label="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error ? <p role="alert">{error}</p> : null}
        <button type="submit">로그인</button>
      </form>
    </main>
  )
}
