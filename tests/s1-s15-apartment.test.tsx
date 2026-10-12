import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../src/App'
import { residentsStore } from '../src/store/residents'
import { stubMobileViewport } from './mobile-test-utils'
import { renderWithRouter } from './test-utils'

beforeEach(() => {
  window.localStorage.clear()
  window.sessionStorage.clear()
})

describe('S1: 메인 히어로', () => {
  it('쌍용 만현마을과 apart 배경·방문신청 CTA가 있다', () => {
    renderWithRouter(<App />)
    expect(screen.getByRole('heading', { name: '쌍용 만현마을' })).toBeInTheDocument()
    expect(document.querySelector('.apartment-hero')).toBeTruthy()
    const css = readFileSync(resolve(__dirname, '../src/index.css'), 'utf8')
    expect(css).toMatch(/apart\.jpeg/)
    expect(screen.getByRole('link', { name: /방문신청/ })).toBeInTheDocument()
  })
})

describe('S14: STWORLD 구독', () => {
  it('메인에 STWORLD·구독 문구가 있다', () => {
    renderWithRouter(<App />)
    expect(screen.getByRole('heading', { name: /STWORLD 월 구독/ })).toBeInTheDocument()
    expect(screen.getByText(/하드웨어/)).toBeInTheDocument()
  })
})

describe('S2–S4: 방문신청 흐름', () => {
  it('동의→방문정보(동·호)·제출까지 완료한다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />, ['/'])
    await user.click(screen.getByRole('link', { name: /방문신청/ }))
    await user.click(screen.getByRole('button', { name: /모두 동의합니다/ }))
    await user.click(screen.getByRole('button', { name: '동의합니다' }))
    const safety = screen.getAllByRole('radio', { name: '동의합니다.' })[0]
    await user.click(safety)
    await user.click(screen.getByRole('button', { name: '동의합니다' }))

    expect(screen.getByLabelText('동')).toBeInTheDocument()
    expect(screen.getByLabelText('호수')).toBeInTheDocument()
    expect(screen.getByText('찾아갈 입주민')).toBeInTheDocument()
    expect(screen.queryByLabelText('차량 번호')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('동'), '101')
    await user.type(screen.getByLabelText('호수'), '1201')
    await user.click(screen.getByRole('button', { name: '검색' }))
    await user.click(screen.getByRole('button', { name: /김입주/ }))
    await user.click(screen.getByLabelText('친척 방문'))
    await user.click(screen.getByLabelText('차량게이트'))
    await user.type(screen.getByLabelText('차량 번호'), '12가3456')
    await user.click(screen.getByRole('button', { name: /다음.*방문자/ }))

    expect(screen.getByRole('radiogroup', { name: '방문 유형' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/소속 회사/)).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/방문자 성명|성명/), '테스트방문자')
    await user.type(screen.getByLabelText(/휴대전화/), '01022223333')
    await user.click(screen.getByRole('button', { name: /신청 완료|제출/ }))
    expect(screen.getByRole('heading', { name: /신청 완료|완료/ })).toBeInTheDocument()
  })
})

describe('S5: 신청 조회', () => {
  it('연락처로 조회한다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />, ['/lookup'])
    await user.type(screen.getByLabelText('성명'), '방문객김')
    await user.type(screen.getByLabelText('휴대전화'), '01099998888')
    await user.click(screen.getByRole('button', { name: /조회|검색/ }))
    expect(screen.getByText('방문객김')).toBeInTheDocument()
    expect(screen.getByText('대기')).toBeInTheDocument()
  })
})

describe('S6–S8·S13: 관리소', () => {
  it('로그인 후 입주자·승인·KPI를 본다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />, ['/manager/login'])
    await user.type(screen.getByLabelText(/ID|아이디|사번/i), 'admin')
    await user.type(screen.getByLabelText(/PW|비밀번호|암호/i), '1234')
    await user.click(screen.getByRole('button', { name: /로그인/ }))
    expect(screen.getByLabelText('오늘 요약')).toBeInTheDocument()
    await user.click(screen.getAllByRole('link', { name: '입주자 명부' })[0])
    expect(screen.getByRole('columnheader', { name: '동' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '호수' })).toBeInTheDocument()
    await user.click(screen.getAllByRole('link', { name: '방문·차량 승인' })[0])
    expect(screen.getByRole('columnheader', { name: '출입유형' })).toBeInTheDocument()
    expect(screen.getByText('차량게이트')).toBeInTheDocument()
  })
})

describe('S9–S11: 입주민 승인·비활성 차단', () => {
  it('입주민이 세대 방문·동현관 승인·임시 오픈한다', async () => {
    const user = userEvent.setup()
    renderWithRouter(<App />, ['/resident/login'])
    await user.type(screen.getByLabelText('아이디'), '1234')
    await user.type(screen.getByLabelText('비밀번호'), '1234')
    await user.click(screen.getByRole('button', { name: /로그인/ }))
    expect(screen.getByRole('heading', { name: '입주민 포털' })).toBeInTheDocument()

    const door = screen.getByLabelText('메인 현관 임시 오픈')
    expect(within(door).getByRole('button', { name: '현관 임시 오픈' })).toBeInTheDocument()
    await user.click(within(door).getByRole('button', { name: '현관 임시 오픈' }))
    expect(within(door).getByRole('status')).toHaveTextContent(/임시 오픈/)

    const section = screen.getByLabelText('세대 방문 승인')
    expect(within(section).getByText('방문객김')).toBeInTheDocument()
    await user.click(within(section).getByRole('button', { name: '승인' }))

    const lobby = screen.getByLabelText('동 현관 승인')
    expect(within(lobby).getByRole('button', { name: /현관 출입 승인/ })).toBeInTheDocument()
  })

  it('비활성 입주자는 관리소 승인이 막힌다', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    residentsStore.setActive('r1', false)
    // host of demo app is r1 — after deactivate, approve should alert
    renderWithRouter(<App />, ['/manager/login'])
    await user.type(screen.getByLabelText(/ID|아이디|사번/i), 'admin')
    await user.type(screen.getByLabelText(/PW|비밀번호|암호/i), '1234')
    await user.click(screen.getByRole('button', { name: /로그인/ }))
    await user.click(screen.getAllByRole('link', { name: '방문·차량 승인' })[0])
    const approveBtns = screen.getAllByRole('button', { name: '승인' })
    await user.click(approveBtns[0])
    expect(window.alert).toHaveBeenCalled()
  })
})

describe('S12: 커뮤니티', () => {
  it('메인에 공지 제목이 보인다', () => {
    renderWithRouter(<App />)
    expect(screen.getByText('엘리베이터 점검 안내')).toBeInTheDocument()
  })
})

describe('S15: 모바일 신청', () => {
  it('모바일 뷰포트에서 신청을 마친다', async () => {
    const user = userEvent.setup()
    stubMobileViewport(375)
    vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderWithRouter(<App />, ['/'])
    expect(document.documentElement.dataset.viewport).toBe('mobile')
    await user.click(screen.getByRole('link', { name: /방문신청/ }))
    await user.click(screen.getByRole('button', { name: /모두 동의합니다/ }))
    await user.click(screen.getByRole('button', { name: '동의합니다' }))
    await user.click(screen.getAllByRole('radio', { name: '동의합니다.' })[0])
    await user.click(screen.getByRole('button', { name: '동의합니다' }))
    await user.type(screen.getByLabelText('동'), '102')
    await user.type(screen.getByLabelText('호수'), '803')
    await user.click(screen.getByRole('button', { name: '검색' }))
    await user.click(screen.getByRole('button', { name: /박입주/ }))
    await user.click(screen.getByLabelText('지인 방문'))
    await user.click(screen.getByLabelText('보행'))
    await user.click(screen.getByRole('button', { name: /다음.*방문자/ }))
    expect(screen.queryByLabelText(/소속 회사/)).not.toBeInTheDocument()
    await user.type(screen.getByLabelText(/방문자 성명|성명/), '모바일자')
    await user.type(screen.getByLabelText(/휴대전화/), '01033334444')
    await user.click(screen.getByRole('button', { name: /신청 완료|제출/ }))
    expect(screen.getByRole('heading', { name: /완료/ })).toBeInTheDocument()
  })
})
