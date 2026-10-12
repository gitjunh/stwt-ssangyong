import {
  CODE_VISIT_AREAS,
  CODE_VISIT_TYPES,
  localAdmin,
  type CodeRow,
} from '../store/adminEntities'

function activeSorted(category: 'LOCATION' | 'PURPOSE'): CodeRow[] {
  return localAdmin
    .listCodesByCategory(category)
    .filter((c) => c.active)
    .slice()
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name, 'ko'))
}

/** 방문 신청 3단계: 기초코드 LOCATION (사용중) */
export function listVisitLocations(): CodeRow[] {
  return activeSorted('LOCATION')
}

/** 방문 신청 3단계: 기초코드 PURPOSE (사용중) */
export function listVisitPurposes(): CodeRow[] {
  return activeSorted('PURPOSE')
}

/** 방문 신청 3단계: 관리 기초코드와 동일 방문유형 */
export function listVisitTypes(): string[] {
  return [...CODE_VISIT_TYPES]
}

/** 장소 코드를 방문지역(area)별 컬럼으로 나눔 */
export function groupLocationsByArea(locations: CodeRow[]): { area: string; items: CodeRow[] }[] {
  const preferred = [...CODE_VISIT_AREAS]
  const map = new Map<string, CodeRow[]>()
  for (const loc of locations) {
    const area = loc.area || preferred[0]
    if (!map.has(area)) map.set(area, [])
    map.get(area)!.push(loc)
  }
  const ordered = preferred
    .filter((area) => map.has(area))
    .map((area) => ({ area, items: map.get(area)! }))
  const rest = [...map.keys()]
    .filter((area) => !preferred.includes(area as (typeof CODE_VISIT_AREAS)[number]))
    .map((area) => ({ area, items: map.get(area)! }))
  return [...ordered, ...rest]
}

export function isOtherPurpose(name: string): boolean {
  return name === '기타' || /^기타/.test(name)
}
