import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppToast from '../components/AppToast'
import WizardFooter from '../components/WizardFooter'
import WizardStepper from '../components/WizardStepper'
import { useAppToast } from '../hooks/useAppToast'
import { useVisitorThemeClass } from '../hooks/useDarkMode'

type ConsentValue = 'agree' | 'disagree' | null

const TOAST_NEED_AGREE = '개인정보 수집 및 이용에 동의해주십시오.'

export default function PrivacyConsent() {
  const navigate = useNavigate()
  const themeClass = useVisitorThemeClass()
  const [collect, setCollect] = useState<ConsentValue>(null)
  const [thirdParty, setThirdParty] = useState<ConsentValue>(null)
  const { message, showToast, clearToast } = useAppToast()

  const allAgreed = collect === 'agree' && thirdParty === 'agree'

  function agreeAll() {
    setCollect('agree')
    setThirdParty('agree')
  }

  function onAgree() {
    if (!allAgreed) {
      showToast(TOAST_NEED_AGREE)
      return
    }
    navigate('/apply/safety')
  }

  function onDisagree() {
    showToast(TOAST_NEED_AGREE)
  }

  return (
    <main className={`wizard-page ${themeClass}`}>
      <WizardStepper current={1} />

      <section className="consent-section" aria-labelledby="consent-a-title">
        <h2 id="consent-a-title">개인정보 수집 및 이용 동의</h2>
        <p className="consent-intro">
          <span className="brand-inline">쌍용 만현마을 관리소</span>는 방문출입 서비스 제공을 위하여 필요한
          최소한의 범위 내에서 아래와 같이 개인정보를 수집하고 있습니다.
        </p>
        <div className="consent-table-wrap">
          <table className="consent-table">
            <thead>
              <tr>
                <th scope="col">수집항목</th>
                <th scope="col">이용목적</th>
                <th scope="col">보유기간</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>소속, 성명</td>
                <td>방문자 확인, 이력 관리</td>
                <td>1년</td>
              </tr>
              <tr>
                <td>휴대전화번호</td>
                <td>방문 승인 알림, 출입증 분실 등을 위한 연락</td>
                <td>1년</td>
              </tr>
              <tr>
                <td>얼굴사진</td>
                <td>방문자 본인 확인</td>
                <td>방문 종료시까지</td>
              </tr>
            </tbody>
          </table>
        </div>
        <fieldset className="consent-radios">
          <legend className="visually-hidden">개인정보 수집 및 이용 동의 선택</legend>
          <label>
            <input
              type="radio"
              name="collect"
              checked={collect === 'agree'}
              onChange={() => setCollect('agree')}
            />
            동의합니다.
          </label>
          <label>
            <input
              type="radio"
              name="collect"
              checked={collect === 'disagree'}
              onChange={() => setCollect('disagree')}
            />
            동의하지 않습니다.
          </label>
        </fieldset>
      </section>

      <section className="consent-section" aria-labelledby="consent-b-title">
        <h2 id="consent-b-title">개인정보 제3자 제공 동의</h2>
        <p className="consent-intro">
          <span className="brand-inline">쌍용 만현마을 관리소</span>는 이용자의 개인정보를 원칙적으로 외부에
          제공하지 않습니다. 다만, 아래의 경우에는 예외로 합니다.
        </p>
        <ul className="consent-bullets">
          <li>이용자들이 사전에 동의한 경우</li>
          <li>
            법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의
            요구가 있는 경우
          </li>
        </ul>
        <fieldset className="consent-radios">
          <legend className="visually-hidden">제3자 제공 관련 동의 선택</legend>
          <label>
            <input
              type="radio"
              name="thirdParty"
              checked={thirdParty === 'agree'}
              onChange={() => setThirdParty('agree')}
            />
            동의합니다.
          </label>
          <label>
            <input
              type="radio"
              name="thirdParty"
              checked={thirdParty === 'disagree'}
              onChange={() => setThirdParty('disagree')}
            />
            동의하지 않습니다.
          </label>
        </fieldset>
      </section>

      <div className="consent-actions">
        <button type="button" className="btn-agree-all" onClick={agreeAll}>
          ✓✓ 모두 동의합니다.
        </button>
        <div className="wizard-actions consent-bottom">
          <button type="button" className="btn-secondary" onClick={onDisagree}>
            동의하지 않습니다
          </button>
          <button type="button" className="btn-primary" onClick={onAgree}>
            동의합니다
          </button>
        </div>
      </div>

      <WizardFooter />
      <AppToast message={message} onClose={clearToast} />
    </main>
  )
}
