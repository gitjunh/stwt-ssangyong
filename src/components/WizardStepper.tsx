type Props = {
  current: 1 | 2 | 3 | 4
}

const STEPS = [
  { id: 1, label: '개인정보동의' },
  { id: 2, label: '방문수칙' },
  { id: 3, label: '방문 정보' },
  { id: 4, label: '방문자 정보' },
] as const

export default function WizardStepper({ current }: Props) {
  return (
    <ol className="wizard-stepper" aria-label="신청 단계">
      {STEPS.map((step) => (
        <li
          key={step.id}
          className={step.id === current ? 'is-current' : undefined}
          aria-current={step.id === current ? 'step' : undefined}
        >
          <span className="wizard-step-num">{step.id}</span>
          <span className="wizard-step-label">{step.label}</span>
        </li>
      ))}
    </ol>
  )
}
