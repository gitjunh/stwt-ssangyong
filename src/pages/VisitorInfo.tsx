import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppToast from '../components/AppToast'
import WizardFooter from '../components/WizardFooter'
import WizardStepper from '../components/WizardStepper'
import { useAppToast } from '../hooks/useAppToast'
import { useVisitorThemeClass } from '../hooks/useDarkMode'
import { clearDraft, readDraft, writeDraft } from '../store/applyDraft'
import { saveApplication, type GateType } from '../store/applications'

type VisitorKind = '일반' | '업무'

export default function VisitorInfo() {
  const navigate = useNavigate()
  const themeClass = useVisitorThemeClass()
  const draft = readDraft()
  const [visitorKind, setVisitorKind] = useState<VisitorKind>(draft.visitorKind || '일반')
  const [company, setCompany] = useState(draft.company)
  const [title, setTitle] = useState(draft.title)
  const [name, setName] = useState(draft.name)
  const [phone, setPhone] = useState(draft.phone)
  const [email, setEmail] = useState(draft.email)
  const [isForeigner, setIsForeigner] = useState(draft.isForeigner)
  const [vehicle, setVehicle] = useState(draft.vehicle)
  const [facePhotoName, setFacePhotoName] = useState(draft.facePhotoName)
  const { message, showToast, clearToast } = useAppToast()

  function onSubmit(event: FormEvent) {
    event.preventDefault()
    const companyValue = visitorKind === '업무' ? company.trim() : ''
    const titleValue = visitorKind === '업무' ? title.trim() : ''
    const current = writeDraft({
      visitorKind,
      company: companyValue,
      title: titleValue,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      isForeigner,
      vehicle: vehicle.trim(),
      facePhotoName,
    })

    if (!current.host || !current.hostId || !current.dong || !current.ho || !current.purpose || !current.gateType) {
      showToast('방문 정보가 없습니다. 이전 단계로 돌아가 주세요.')
      navigate('/apply/visit-info')
      return
    }
    if (!current.name.trim() || !current.phone.trim()) {
      showToast('성명과 휴대전화를 입력해 주세요.')
      return
    }
    if (visitorKind === '업무' && !companyValue) {
      showToast('업무 방문은 소속 회사를 입력해 주세요.')
      return
    }

    const gate = current.gateType as GateType
    saveApplication({
      id: `app-${Date.now()}`,
      name: current.name,
      phone: current.phone,
      status: '대기',
      visitorKind,
      company: companyValue || undefined,
      title: titleValue || undefined,
      visitAt: `${current.visitStart}T09:00`,
      visitStart: current.visitStart,
      visitEnd: current.visitEnd,
      visitType: visitorKind === '업무' ? '업무방문' : current.visitType || '방문(일반)',
      purpose: current.purpose,
      place: `${current.dong}동 ${current.ho}호`,
      dong: current.dong,
      ho: current.ho,
      host: current.host,
      hostId: current.hostId,
      gateType: gate,
      vehicle: current.vehicle || undefined,
      vehicleStatus: gate === '차량게이트' ? '대기' : undefined,
      lobbyStatus: gate === '동현관' ? '대기' : undefined,
      facePhotoName: current.facePhotoName || undefined,
    })
    clearDraft()
    navigate('/apply/complete')
  }

  return (
    <main className={`wizard-page ${themeClass}`}>
      <WizardStepper current={4} />
      <h1>방문자 정보</h1>

      <form className="visit-form" onSubmit={onSubmit}>
        <fieldset className="field-block">
          <legend>방문 유형 *</legend>
          <div className="radio-grid two-col" role="radiogroup" aria-label="방문 유형">
            <label className={visitorKind === '일반' ? 'is-checked' : undefined}>
              <input
                type="radio"
                name="visitorKind"
                checked={visitorKind === '일반'}
                onChange={() => setVisitorKind('일반')}
              />
              일반 방문 (개인·지인)
            </label>
            <label className={visitorKind === '업무' ? 'is-checked' : undefined}>
              <input
                type="radio"
                name="visitorKind"
                checked={visitorKind === '업무'}
                onChange={() => setVisitorKind('업무')}
              />
              업무 방문 (업체·공사)
            </label>
          </div>
          <p className="field-hint">
            {visitorKind === '일반'
              ? '일반 방문은 소속 회사·직급을 묻지 않습니다.'
              : '업무 방문은 소속 회사 입력이 필요합니다.'}
          </p>
        </fieldset>

        <section className="face-photo">
          <h2>방문자 사진</h2>
          <label>
            사진 등록
            <input
              name="facePhoto"
              type="file"
              accept="image/*"
              capture="user"
              onChange={(e) => setFacePhotoName(e.target.files?.[0]?.name ?? '')}
            />
          </label>
          {facePhotoName ? <p className="field-hint">등록: {facePhotoName}</p> : null}
        </section>

        {visitorKind === '업무' ? (
          <>
            <label>
              소속 회사 *
              <input
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
            </label>
            <label>
              직급
              <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
          </>
        ) : null}

        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={isForeigner}
            onChange={(e) => setIsForeigner(e.target.checked)}
          />
          외국인
        </label>
        <label>
          성명 *
          <input name="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          휴대전화번호 *
          <input
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </label>
        <label>
          이메일
          <input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          차량번호
          <input
            name="vehicle"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            placeholder="차량 이용 시 입력"
          />
        </label>

        <div className="wizard-actions consent-bottom">
          <button type="button" className="btn-secondary" onClick={() => navigate('/apply/visit-info')}>
            이전
          </button>
          <button type="submit" className="btn-primary">
            신청 완료
          </button>
        </div>
      </form>

      <WizardFooter />
      <AppToast message={message} onClose={clearToast} />
    </main>
  )
}
