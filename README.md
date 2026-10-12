# 쌍용 만현마을 — STWORLD 스마트 방문출입

구축 아파트용 방문·차량·동현관 출입 신청/승인 웹 MVP. 기업용 `sites/terea` 패턴을 아파트 역할(방문자·입주민·관리소)로 재구성했습니다.

## 실행

```bash
cd sites/ssangyong
npm install
npm run dev
npm test
```

## 데모 계정

| 역할 | 값 |
| --- | --- |
| 관리소 | `admin` / `1234` |
| 입주민 | `1234` / `1234` |

## 범위

- 포함: 방문 신청, 조회, 입주민 승인, 동 현관, 입주자 명부, 공지, KPI, STWORLD 구독 안내, `apart.jpeg` 히어로
- 제외: 실 HW 연동, 네이티브 앱, 결제
