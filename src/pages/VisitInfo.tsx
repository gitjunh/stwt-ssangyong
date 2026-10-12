import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppToast from '../components/AppToast'
import WizardFooter from '../components/WizardFooter'
import WizardStepper from '../components/WizardStepper'
import { useAppToast } from '../hooks/useAppToast'
import { useVisitorThemeClass } from '../hooks/useDarkMode'
import type { GateType } from '../store/applications'
import { readDraft, writeDraft } from '../store/applyDraft'
import { residentsStore } from '../store/residents'

const PURPOSES = ['친척 방문', '지인 방문', '택배·배송', '공사·AS', '기타'] as const
const GATES: GateType[] = ['차량게이트', '동현관', '보행']

function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function VisitInfo() {
  const navigate = useNavigate()
  const themeClass = useVisitorThemeClass()
  const initial = readDraft()
  const [dong, setDong] = useState(initial.dong)
  const [ho, setHo] = useState(initial.ho)
  const [host, setHost] = useState(initial.host)
  const [hostId, setHostId] = useState(initial.hostId)
  const [purpose, setPurpose] = useState(initial.purpose)
  const [purposeOther, setPurposeOther] = useState(initial.purposeOther)
  const [gateType, setGateType] = useState<GateType | ''>(initial.gateType)
  const [vehicle, setVehicle] = useState(initial.vehicle)
  const [visitStart, setVisitStart] = useState(initial.visitStart || todayISO())
  const [visitEnd, setVisitEnd] = useState(initial.visitEnd || todayISO())
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState(residentsStore.listActive().slice(0, 5))
  const { message, showToast, clearToast } = useAppToast()

  function runSearch() {
    const q = query.trim() || [dong.trim(), ho.trim()].filter(Boolean).join(' ')
    setHits(residentsStore.search(q))
  }

  function pickHost(id: string, name: string, d: string, h: string) {
    setHostId(id)
    setHost(name)
    setDong(d)
    setHo(h)
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!dong.trim() || !ho.trim()) {
      showToast('동·호수를 입력해 주세요.')
      return
    }
    if (!host.trim() || !hostId) {
      showToast('찾아갈 입주민을 선택해 주세요.')
      return
    }
    if (!residentsStore.canApproveVisits(hostId)) {
      showToast('비활성 입주자로는 방문 신청할 수 없습니다.')
      return
    }
    if (!purpose || (purpose === '기타' && !purposeOther.trim())) {
      showToast('방문 목적을 입력해 주세요.')
      return
    }
    if (!gateType) {
      showToast('출입 유형을 선택해 주세요.')
      return
    }
    if (gateType === '차량게이트' && !vehicle.trim()) {
      showToast('차량 번호를 입력해 주세요.')
      return
    }
    writeDraft({
      dong: dong.trim(),
      ho: ho.trim(),
      host: host.trim(),
      hostId,
      purpose: purpose === '기타' ? purposeOther.trim() : purpose,
      purposeOther,
      gateType,
      vehicle: vehicle.trim(),
      visitStart,
      visitEnd,
      visitType: '방문(일반)',
      locations: [`${dong.trim()}동 ${ho.trim()}호`],
    })
    navigate('/apply/visitor-info')
  }

  return (
    <main className={`wizard-page ${themeClass}`}>
      <WizardStepper current={3} />
      <h1>방문 정보</h1>
      <form onSubmit={onSubmit} className="wizard-form">
        <label>
          동
          <input name="dong" aria-label="동" value={dong} onChange={(e) => setDong(e.target.value)} />
        </label>
        <label>
          호수
          <input name="ho" aria-label="호수" value={ho} onChange={(e) => setHo(e.target.value)} />
        </label>
        <fieldset className="field-block">
          <legend>찾아갈 입주민</legend>
          <div className="host-search-row">
            <input
              aria-label="입주민 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="성명·동·호"
            />
            <button type="button" onClick={runSearch}>
              검색
            </button>
          </div>
          <ul className="host-hit-list">
            {hits.map((h) => (
              <li key={h.id}>
                <button
                  type="button"
                  className="host-hit-btn"
                  onClick={() => pickHost(h.id, h.name, h.dong, h.ho)}
                >
                  <span className="host-hit-name">{h.name}</span>
                  <span className="host-hit-meta">
                    {h.dong}동 {h.ho}호
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="field-hint">선택: {host ? `${host} (${dong}동 ${ho}호)` : '없음'}</p>
        </fieldset>
        <fieldset className="field-block">
          <legend>방문 목적</legend>
          <div className="radio-grid two-col">
            {PURPOSES.map((p) => (
              <label key={p}>
                <input
                  type="radio"
                  name="purpose"
                  value={p}
                  checked={purpose === p}
                  onChange={() => setPurpose(p)}
                />
                {p}
              </label>
            ))}
          </div>
          {purpose === '기타' ? (
            <label>
              기타 목적
              <input value={purposeOther} onChange={(e) => setPurposeOther(e.target.value)} />
            </label>
          ) : null}
        </fieldset>
        <fieldset className="field-block">
          <legend>출입 유형</legend>
          <div className="radio-grid two-col">
            {GATES.map((g) => (
              <label key={g}>
                <input
                  type="radio"
                  name="gateType"
                  value={g}
                  checked={gateType === g}
                  onChange={() => setGateType(g)}
                />
                {g}
              </label>
            ))}
          </div>
        </fieldset>
        {gateType === '차량게이트' ? (
          <label>
            차량 번호
            <input
              aria-label="차량 번호"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
            />
          </label>
        ) : null}
        <label>
          방문 시작
          <input type="date" aria-label="방문 시작" value={visitStart} onChange={(e) => setVisitStart(e.target.value)} />
        </label>
        <label>
          방문 종료
          <input type="date" aria-label="방문 종료" value={visitEnd} onChange={(e) => setVisitEnd(e.target.value)} />
        </label>
        <button type="submit">다음 · 방문자 정보</button>
        <WizardFooter />
      </form>
      <AppToast message={message} onClose={clearToast} />
    </main>
  )
}
