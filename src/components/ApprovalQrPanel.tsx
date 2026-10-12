import { QRCodeSVG } from 'qrcode.react'
import { SECURITY_VISIT_MESSAGE, qrCodeFor, qrPayload } from '../lib/visitQr'

export { SECURITY_VISIT_MESSAGE, qrCodeFor, qrPayload }

type Props = {
  applicationId: string
  name: string
  phone: string
  code?: string
  message?: string
}

export default function ApprovalQrPanel({
  applicationId,
  name,
  phone,
  code = qrCodeFor(applicationId),
  message = SECURITY_VISIT_MESSAGE,
}: Props) {
  const value = qrPayload(applicationId, code)
  return (
    <section className="qr-notice-panel" role="region" aria-label="QR 안내">
      <h2>승인 QR 안내</h2>
      <p>{message}</p>
      <div className="qr-visual" aria-label="방문 승인 QR 코드">
        <QRCodeSVG value={value} size={180} level="M" includeMargin />
      </div>
      <p className="qr-code">QR 코드: {code}</p>
      <p>
        대상: {name} ({phone})
      </p>
    </section>
  )
}
