#!/usr/bin/env node
/**
 * 로컬에서 내보낸 adminCodesSeed.json을 배포 시드 파일로 복사한다.
 * 사용: npm run sync-codes-seed -- ./adminCodesSeed.json
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dest = resolve(root, 'src/data/adminCodesSeed.json')
const src = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : null

if (!src || !existsSync(src)) {
  console.error('사용법: npm run sync-codes-seed -- <내보낸-adminCodesSeed.json 경로>')
  process.exit(1)
}

const parsed = JSON.parse(readFileSync(src, 'utf8'))
if (!Array.isArray(parsed.codes) || !parsed.codes.length) {
  console.error('유효한 codes 배열이 없습니다.')
  process.exit(1)
}
if (typeof parsed.seedVersion !== 'number') {
  parsed.seedVersion = Date.now()
}

writeFileSync(dest, `${JSON.stringify(parsed, null, 2)}\n`, 'utf8')
console.log(`시드 반영: ${dest} (seedVersion=${parsed.seedVersion}, codes=${parsed.codes.length})`)
console.log('이어서 커밋·푸시·배포하면 사이트 기본 기초코드가 갱신됩니다.')
