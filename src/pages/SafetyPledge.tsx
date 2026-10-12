import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppToast from '../components/AppToast'
import WizardFooter from '../components/WizardFooter'
import WizardStepper from '../components/WizardStepper'
import { useAppToast } from '../hooks/useAppToast'
import { useVisitorThemeClass } from '../hooks/useDarkMode'

const PLEDGE_CLAUSES = [
  '방문 목적과 찾아갈 세대를 정확히 확인한 뒤 출입하며, 허가되지 않은 동·호에는 들어가지 않습니다.',
  '단지 내에서는 서행·지정 차로를 지키고, 비상차로·장애인 주차구역을 막지 않습니다.',
  '엘리베이터·복도·현관 등 공용부에서 큰 소음을 내지 않으며, 늦은 시간 방문 시 더 조용히 이동합니다.',
  '공용부 흡연을 하지 않으며, 쓰레기는 지정 장소에만 버립니다.',
  '어린이·노약자·반려동물이 있는 공간을 배려하고, 출입문을 임의로 장시간 열어두지 않습니다.',
  '택배·배달 등 단기 출입은 입주민 승인·임시 오픈 안내에 따르며, 승인 범위를 넘지 않습니다.',
  '시설물·조경·소방시설을 훼손하지 않으며, 이상 발견 시 관리소 또는 입주민에게 알립니다.',
  '개인정보·출입 QR·승인 안내는 본인만 사용하고, 타인에게 양도하지 않습니다.',
] as const

const TOAST_NEED_AGREE = '단지 방문 수칙에 동의해 주십시오.'

type ConsentValue = 'agree' | 'disagree' | null

export default function SafetyPledge() {
  const navigate = useNavigate()
  const themeClass = useVisitorThemeClass()
  const [consent, setConsent] = useState<ConsentValue>(null)
  const { message, showToast, clearToast } = useAppToast()

  function onAgree() {
    if (consent !== 'agree') {
      showToast(TOAST_NEED_AGREE)
      return
    }
    navigate('/apply/visit-info')
  }

  function onDisagree() {
    showToast(TOAST_NEED_AGREE)
  }

  return (
    <main className={`wizard-page ${themeClass}`}>
      <WizardStepper current={2} />
      <h1>단지 방문 수칙 동의</h1>

      <section className="pledge-body" aria-label="방문 수칙 본문">
        <p className="pledge-intro">
          쌍용 만현마을을 방문하시는 분은 입주민과 이웃의 안전을 위해 아래 단지 방문 수칙을 확인하고
          동의합니다.
        </p>
        <ol className="pledge-clauses">
          {PLEDGE_CLAUSES.map((clause, index) => (
            <li key={clause}>
              {index + 1}. {clause}
            </li>
          ))}
        </ol>
      </section>

      <fieldset className="consent-radios">
        <legend className="visually-hidden">단지 방문 수칙 동의 선택</legend>
        <label>
          <input
            type="radio"
            name="safety"
            checked={consent === 'agree'}
            onChange={() => setConsent('agree')}
          />
          동의합니다.
        </label>
        <label>
          <input
            type="radio"
            name="safety"
            checked={consent === 'disagree'}
            onChange={() => setConsent('disagree')}
          />
          동의하지 않습니다.
        </label>
      </fieldset>

      <div className="wizard-actions consent-bottom">
        <button type="button" className="btn-secondary" onClick={onDisagree}>
          동의하지 않습니다
        </button>
        <button type="button" className="btn-primary" onClick={onAgree}>
          동의합니다
        </button>
      </div>

      <WizardFooter />
      <AppToast message={message} onClose={clearToast} />
    </main>
  )
}
