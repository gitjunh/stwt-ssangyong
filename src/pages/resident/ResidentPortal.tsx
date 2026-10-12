import { FormEvent, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { clearResidentSession, getResidentSession } from '../../auth/residentSession'
import {
  listApplications,
  updateApplicationStatus,
  updateLobbyStatus,
} from '../../store/applications'
import { communityStore } from '../../store/community'
import {
  createDoorOpen,
  isDoorOpenActive,
  listDoorOpens,
  type DoorOpenReason,
} from '../../store/doorOpens'
import { residentsStore } from '../../store/residents'

const OPEN_REASONS: DoorOpenReason[] = ['배달', '택배', '방문객', '기타']
const OPEN_MINUTES = [1, 3, 5, 10] as const

export default function ResidentPortal() {
  const session = getResidentSession()
  const me = session ? residentsStore.findById(session.id) : null
  const [tick, setTick] = useState(0)
  const [reason, setReason] = useState<DoorOpenReason>('배달')
  const [minutes, setMinutes] = useState<(typeof OPEN_MINUTES)[number]>(3)
  const [note, setNote] = useState('')
  const [lastOpenMsg, setLastOpenMsg] = useState('')
  const apps = useMemo(() => listApplications(), [tick])
  const doorLogs = useMemo(() => (me ? listDoorOpens(me.dong) : []), [tick, me])

  if (!me) return <Navigate to="/resident/login" replace />

  const mine = apps.filter((a) => a.hostId === me.id && (a.status === '대기' || a.status === '신청'))
  const lobby = apps.filter(
    (a) => a.dong === me.dong && a.gateType === '동현관' && a.lobbyStatus === '대기',
  )
  const notices = communityStore.list()
  const activeOpens = doorLogs.filter((d) => isDoorOpenActive(d))

  function refresh() {
    setTick((t) => t + 1)
  }

  function onTempOpen(event: FormEvent) {
    event.preventDefault()
    const row = createDoorOpen({
      residentId: me!.id,
      dong: me!.dong,
      ho: me!.ho,
      reason,
      note,
      minutes,
    })
    setNote('')
    setLastOpenMsg(
      `${me!.dong}동 메인 현관을 ${minutes}분간 임시 오픈했습니다. (${reason}${row.note ? ` · ${row.note}` : ''})`,
    )
    refresh()
  }

  return (
    <main className="resident-portal">
      <header className="resident-header">
        <div>
          <p className="brand">쌍용 만현마을</p>
          <h1>입주민 포털</h1>
          <p>
            {me.name} · {me.dong}동 {me.ho}호
          </p>
        </div>
        <div className="resident-header-actions">
          <Link to="/">단지 홈</Link>
          <button
            type="button"
            onClick={() => {
              clearResidentSession()
              window.location.href = '/resident/login'
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      <section className="door-open-panel" aria-label="메인 현관 임시 오픈">
        <h2>메인 현관 임시 오픈</h2>
        <p className="door-open-lead">
          배달·택배 등 잠시 문을 열어야 할 때, {me.dong}동 메인 현관을 임시로 오픈할 수 있습니다.
        </p>
        <form className="door-open-form" onSubmit={onTempOpen}>
          <fieldset className="field-block">
            <legend>오픈 사유 *</legend>
            <div className="radio-grid two-col">
              {OPEN_REASONS.map((item) => (
                <label key={item} className={reason === item ? 'is-checked' : undefined}>
                  <input
                    type="radio"
                    name="doorReason"
                    checked={reason === item}
                    onChange={() => setReason(item)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </fieldset>
          <label>
            오픈 시간(분) *
            <select
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value) as (typeof OPEN_MINUTES)[number])}
            >
              {OPEN_MINUTES.map((m) => (
                <option key={m} value={m}>
                  {m}분
                </option>
              ))}
            </select>
          </label>
          <label>
            메모
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="예: 쿠팡 기사, 현관 벨"
            />
          </label>
          <button type="submit" className="btn-primary door-open-submit">
            현관 임시 오픈
          </button>
        </form>
        {lastOpenMsg ? (
          <p className="door-open-result" role="status">
            {lastOpenMsg}
          </p>
        ) : null}
        {activeOpens.length > 0 ? (
          <ul className="door-open-active" aria-label="진행 중 오픈">
            {activeOpens.slice(0, 3).map((row) => (
              <li key={row.id}>
                {row.ho}호 · {row.reason} · {row.minutes}분 (
                {new Date(row.expiresAt).toLocaleTimeString('ko-KR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                까지)
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-label="세대 방문 승인">
        <h2>내 세대 방문 승인</h2>
        <p className="door-open-lead">우리 세대를 찾아오는 방문 신청을 승인·반려합니다.</p>
        <table className="visitor-table">
          <thead>
            <tr>
              <th>방문자</th>
              <th>목적</th>
              <th>출입</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {mine.length === 0 ? (
              <tr>
                <td colSpan={4}>대기 중인 세대 방문이 없습니다.</td>
              </tr>
            ) : (
              mine.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.purpose}</td>
                  <td>{row.gateType}</td>
                  <td>
                    <button
                      type="button"
                      className="approve-btn"
                      onClick={() => {
                        updateApplicationStatus(row.id, '승인')
                        refresh()
                      }}
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      className="reject-btn"
                      onClick={() => {
                        updateApplicationStatus(row.id, '반려')
                        refresh()
                      }}
                    >
                      반려
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section aria-label="동 현관 승인">
        <h2>동 메인 현관 출입 승인</h2>
        <p className="door-open-lead">
          같은 동({me.dong}동) 메인 현관 출입 요청을 승인하면 방문자가 동 출입문을 통과할 수 있습니다.
        </p>
        <table className="visitor-table">
          <thead>
            <tr>
              <th>방문자</th>
              <th>호수</th>
              <th>목적</th>
              <th>처리</th>
            </tr>
          </thead>
          <tbody>
            {lobby.length === 0 ? (
              <tr>
                <td colSpan={4}>대기 중인 동 현관 요청이 없습니다.</td>
              </tr>
            ) : (
              lobby.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>{row.ho}호</td>
                  <td>{row.purpose ?? '-'}</td>
                  <td>
                    <button
                      type="button"
                      className="approve-btn"
                      onClick={() => {
                        updateLobbyStatus(row.id, '승인')
                        refresh()
                      }}
                    >
                      현관 출입 승인
                    </button>
                    <button
                      type="button"
                      className="reject-btn"
                      onClick={() => {
                        updateLobbyStatus(row.id, '반려')
                        refresh()
                      }}
                    >
                      반려
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      <section aria-label="단지 공지">
        <h2>단지 공지</h2>
        <ul>
          {notices.map((n) => (
            <li key={n.id}>
              <strong>{n.title}</strong> — {n.body}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
