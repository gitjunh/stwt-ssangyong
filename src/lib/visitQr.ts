export const SECURITY_VISIT_MESSAGE =
  '방문 승인이 완료되었습니다. 아래 QR 코드를 제시하고 경비실로 방문해 주세요.'

export function qrCodeFor(applicationId: string): string {
  return `TEREA-QR-${applicationId}`
}

export function qrPayload(applicationId: string, code: string): string {
  return `ssangyong-visit:${applicationId}:${code}`
}
