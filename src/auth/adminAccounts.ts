/**
 * 로컬 복제본 전용 관리 테스트 계정(원본 운영 사이트 계정 아님).
 * README에도 동일 값을 안내한다.
 */
export const LOCAL_ADMIN_SEED = {
  id: 'admin',
  password: '1234',
} as const

export function verifyAdminCredentials(id: string, password: string): boolean {
  return id.trim() === LOCAL_ADMIN_SEED.id && password === LOCAL_ADMIN_SEED.password
}
