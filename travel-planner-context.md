# 여행 플래너 앱 — 프로젝트 컨텍스트 (2026.03.15 기준)

## 프로젝트 개요
효진+승민의 도쿄·하코네 4박5일 여행(2026.03.26~30)을 위한 **React 웹앱 여행 플래너**.
Claude 아티팩트(.jsx)로 구현, persistent storage(window.storage)로 데이터 유지.
앞으로 다른 여행에도 같은 포맷으로 재사용할 수 있는 범용 구조.

## 현재 파일 위치
- **메인 파일**: `/mnt/user-data/outputs/travel-planner.jsx`
- **대화 트랜스크립트**: `/mnt/transcripts/2026-03-15-08-30-27-tokyo-hakone-travel-planning.txt`

## 구현 완료된 기능 (Phase 1~3 전체)

### 📅 일정 탭
- Day별 아코디언 카드 (DAY 배지 + 제목 + 날짜)
- 타임라인 아이템: 이모지 배지(36px), 핵심/스킵/미정 상태, 좌측 accent bar
- 아이템 탭 → 수정 다이얼로그 (시간, 내용, 타입, 핵심/스킵/미정 Switch)
- 아이템 추가/삭제
- **시간순 정렬 버튼** (각 Day 하단)
- Day별 메모 표시

### 💰 경비 탭
- 인디고 그라디언트 서머리 카드 + 도넛 차트
- 확정/예상 구분, 1인당 자동 계산
- 카테고리별 컬러 legend
- 필터 (전체/교통/숙소/식비/활동/기타)
- 아이템 탭 → 인라인 편집 (이름, 금액, 카테고리)
- ₩↔¥ 통화 토글 (환율 자동 환산)
- 확정 토글 (✅/⭕)
- 삭제 (확인 다이얼로그)
- CSV 다운로드 (📥 버튼)
- **FAB (₩ 버튼)**: 하단 중앙, 빠른 지출 입력, 엔화 기본, 실시간 환산 표시

### ✅ 체크리스트 탭
- 진행률 프로그레스 바 (코랄→앰버 그라디언트)
- 카테고리 필터 (전체/예약/서류/준비/짐싸기)
- 아이템 탭 → 인라인 편집
- 추가/삭제 (확인 다이얼로그)

### 📝 메모 탭
- 전체 여행 메모 (textarea)
- Day별 메모 (각 Day 카드)

### ⚙️ 설정 & 여행 관리
- 설정: 이름, 이모지, 기간, 출발일(D-Day용), 인원, 환율
- D-Day 카운트다운 배지 (헤더)
- 여행 추가/삭제/전환
- 초기화(↺) 버튼

## 디자인 시스템 (현재 적용됨)

### 컬러 팔레트
```
coral: #E8735A (포인트)     coralLight: #FDEAE5
indigo: #2D3561 (2차)      indigoLight: #E8EAF6
mint: #4ECDC4 (식비)       amber: #F4A261 (숙소/예상)
violet: #7C5CFC (활동)     rose: #E84393
배경: peach→cream→sand 그라디언트
```

### 카테고리 컬러 매핑
```
교통: indigo (#2D3561)  🚃
숙소: amber (#F4A261)   🏨
식비: mint (#4ECDC4)    🍽️
활동: violet (#7C5CFC)  ⭐
기타: textSoft (#6B7280) 📦
```

### 스타일 특성
- **Glassmorphism**: backdrop-blur(20px) + rgba(255,255,255,0.72) + soft shadow
- **border-radius**: 20px (카드), 14px (버튼/인풋), 50px (pill)
- **폰트**: Nunito (Google) + Pretendard (한글 fallback)
- **FAB**: 코랄→앰버 그라디언트 원형, pulse 애니메이션
- **lucide-react 미사용** — 아티팩트 환경에서 로드 실패하므로 이모지/네이티브 문자 사용

### 간격 시스템 (4px 그리드) — ⚠️ 현재 작업 중
```javascript
const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
```
적용 규칙:
- 페이지 좌우 패딩: xl (20px)
- 카드 내부 패딩: lg~xl (16~20px)
- 카드 간 gap: md (12px)
- 아이템 간 gap: sm (8px)
- 아이템 내부 gap: sm (8px)
- 라벨→인풋 간격: xs (4px)
- 폼 필드 간 gap: md (12px)
- 액션 버튼 row gap: sm (8px)

## ⚠️ 현재 미완료 작업 (이어서 해야 할 것)

### 1. 간격 통일 작업 (진행 중)
S 토큰을 정의하고 메인 레이아웃(헤더, 탭, 일정, 경비 일부)에 적용 완료.
**아직 남은 부분:**
- `ExpInline` 컴포넌트 — gap이 `10`으로 되어있음 → `S.md` (12)
- `ChkInline` 컴포넌트 — gap `10` → `S.md`
- `QuickExp` 컴포넌트 — gap `10` → `S.md`
- `AddExpForm` 컴포넌트 — gap `14` → `S.md`
- `AddChkForm` 컴포넌트 — gap `14` → `S.md`
- `AddTripForm` 컴포넌트 — gap `10` → `S.md`
- `SettingsForm` 컴포넌트 — gap `12` → `S.md`
- 모든 label에 `display: "block", marginBottom: S.xs` 통일 (현재 일부만 적용)
- trip 관리 다이얼로그 내부 gap `12` → `S.md`

### 2. 구체적인 수정이 필요한 줄 (현재 파일 기준)
파일의 서브컴포넌트들 (약 540번째 줄~647번째 줄)에서:
- `gap: 10` → `gap: S.md`
- `gap: 14` → `gap: S.md`
- `gap: 6` → `gap: S.sm`
- `gap: 4` → `gap: S.xs`
- `marginBottom: 6` → `marginBottom: S.sm`
- `marginTop: 4` → `marginTop: S.xs`
- `marginTop: -4` → `marginTop: -S.xs`
- 라벨과 인풋 사이에 `marginBottom: S.xs` 일관 적용

## Storage 키
- 현재 버전: `tp-v6`
- 이전 버전들: `tp-v5`, `tp-v4`, `travel-planner-v3`, `travel-planner-v2`, `travel-planner-v1`

## 기술 제약사항
- **Claude 아티팩트 환경**: .jsx 파일, shadcn/ui 내장, Tailwind 내장
- **lucide-react**: `import { X } from "lucide-react"` 형태 로드 실패 → 이모지 사용
- **localStorage**: 아티팩트에서 사용 불가 → `window.storage` API 사용
- **외부 네트워크**: Google Fonts @import는 작동함
- **shadcn/ui 컴포넌트**: Dialog, Switch, Progress, Input, Label, Tabs 등 사용 가능
  하지만 현재는 대부분 inline style로 구현 (shadcn 클래스보다 직접 제어 선호)

## 도쿄 여행 데이터 (기본값으로 하드코딩됨)
- Day 1: 도착 + 벚꽃 + 겐카사카구라
- Day 2: 렌터카 후지산 + 하코네 료칸
- Day 3: 카구라자카 + 칸아가리 + 골든가이
- Day 4: 해리포터 + 기치조지 + 스시 오마카세(TBD)
- Day 5: 귀국
- 경비 16항목, 체크리스트 22항목 프리로드

## 향후 개선 아이디어 (미구현)
- 일정 항목에 구글맵 링크/장소 URL 필드
- Day 추가/삭제/순서 변경
- 경비에 Day 태깅 + Day별 소계
- 체크리스트 드래그 정렬
- 다크 모드
- PWA 오프라인 지원 (아티팩트 환경 한계)
