# Travel Planner — React 웹앱

## 프로젝트 개요
효진+승민의 도쿄·하코네 4박5일 여행(2026.03.26~30)을 위한 React 여행 플래너.
향후 다른 여행에도 동일 포맷으로 재사용 가능한 범용 구조.

## 기술 스택
- **빌드**: Vite 8 + React 19
- **UI 라이브러리**: @radix-ui/react-dialog, @dnd-kit (드래그앤드롭)
- **스토리지**: localStorage (`tp-v6` 키)
- **스타일링**: 인라인 스타일 (CSS Custom Properties 기반 디자인 토큰)
- **폰트**: Outfit (Google Fonts) + Pretendard (한글, CDN)
- **아이콘**: 이모지 (외부 아이콘 라이브러리 미사용)
- **패키지 매니저**: pnpm
- **배포**: Vercel

## 아키텍처

### 파일 구조
```
src/
├── App.jsx              # 메인 앱 (라우팅, 다이얼로그, 레이아웃)
├── tokens.js            # 디자인 토큰 (S, T, CAT, THEME_LIGHT/DARK)
├── styles.js            # 공통 스타일 (glass, pill, inputStyle, btnPrimary)
├── storage.js           # localStorage 래퍼
├── data/
│   └── defaults.js      # 기본 여행 데이터
├── hooks/
│   ├── useTrips.js      # 여행 CRUD, Day 조작, 예산/체크리스트 집계
│   ├── useTheme.js      # 다크모드 (auto/light/dark)
│   └── useWeather.js    # 날씨 예보 (wttr.in API, 1시간 캐시)
└── components/
    ├── ItineraryTab.jsx  # 일정 탭 (DnD, Day 관리, 날씨)
    ├── BudgetTab.jsx     # 경비 탭 (도넛, 정산, Day 소계)
    ├── ChecklistTab.jsx  # 체크리스트 탭 (DnD, 템플릿)
    ├── MemoTab.jsx       # 메모 탭
    ├── forms/
    │   ├── ItemForm.jsx     # 일정 추가/수정 폼
    │   ├── AddExpForm.jsx   # 경비 추가 폼
    │   ├── ExpInline.jsx    # 경비 인라인 편집
    │   ├── QuickExp.jsx     # FAB 빠른 지출 입력
    │   ├── AddChkForm.jsx   # 체크리스트 추가 폼
    │   ├── ChkInline.jsx    # 체크리스트 인라인 편집
    │   ├── AddTripForm.jsx  # 새 여행 추가 폼
    │   └── SettingsForm.jsx # 여행 설정 (이름, 인원, 환율, 동행자, 테마, 초기화)
    └── ui/
        ├── Donut.jsx        # SVG 도넛 차트
        ├── Empty.jsx        # 빈 상태 + CTA 버튼
        ├── Toast.jsx        # Toast 알림 시스템
        └── ToggleSwitch.jsx # 토글 스위치
```

### Custom Hooks
- **useTrips**: 전체 비즈니스 로직 (CRUD, Day ops, useMemo 집계, CSV/공유 export)
- **useTheme**: CSS Custom Properties 기반 테마 전환
- **useWeather**: wttr.in API → Day 헤더에 날씨 이모지 + 온도 표시

## 디자인 시스템

### 간격 토큰 (4px 그리드)
```javascript
const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
```

### 컬러 (CSS Custom Properties)
```
코랄: var(--c-coral)        코랄라이트: var(--c-coral-lt)
인디고: var(--c-indigo)     민트: var(--c-mint)
앰버: var(--c-amber)        바이올렛: var(--c-violet)
```
- 라이트/다크 값은 `tokens.js`의 `THEME_LIGHT` / `THEME_DARK`에 정의
- `T.text`, `T.textSoft`, `T.textMuted` 3단계 텍스트 계층

### 카테고리 컬러
교통(indigo), 숙소(amber), 식비(mint), 활동(violet), 기타(textSoft)

### 스타일 특성
- 글래스모피즘: blur(12px) + rgba + 미세한 보더
- border-radius: 14px (카드), 10px (버튼/인풋), 50px (pill)
- 다크모드: `color-scheme: dark` for native inputs

## 구현된 기능

### 📅 일정 탭
- Day별 아코디언 카드 (DAY 배지 + 제목 + 날짜 + 날씨)
- 타임라인 아이템: 이모지 배지, 핵심/스킵/미정 상태, 좌측 accent bar
- 드래그앤드롭 순서 변경 (⠿ 핸들, @dnd-kit, PointerSensor 5px + TouchSensor 200ms)
- 시간순 정렬 버튼
- Day 추가/삭제/제목·날짜 인라인 편집
- 장소 URL 필드 (📍 링크)
- 오늘의 일정: 자동 펼치기, "오늘" 배지, 다음 일정 민트 하이라이트
- 날씨 예보: wttr.in API, Day 헤더에 이모지 + 온도 (5일 이내)
- Empty state CTA ("＋ Day 추가" 버튼)

### 💰 경비 탭
- 인디고 서머리 카드 + SVG 도넛 차트
- 확정/예상 구분, 1인당 자동 계산
- 카테고리 필터 + 컬러 legend
- 인라인 편집 (이름, 금액, 카테고리, Day, 결제자)
- ₩↔¥ 통화 토글
- Day 태깅 + Day별 소계 카드
- 경비 정산: 결제자(paidBy) 기록 → 자동 정산 결과 ("A → B에게 ₩X 보내기")
- FAB (₩ 버튼): 경비 탭에서만 표시, 빠른 지출 입력
- CSV 다운로드
- Empty state CTA

### ✅ 체크리스트 탭
- 진행률 프로그레스 바
- 카테고리 필터
- 드래그앤드롭 순서 변경 (필터 적용 시에도 정상 동작)
- 인라인 편집, 추가/삭제
- 짐싸기 템플릿: 🧳 버튼으로 일본여행 기본 12개 아이템 원클릭 추가 (중복 방지)
- 체크 애니메이션 (check-pop)
- Empty state CTA

### 📝 메모 탭
- 전체 여행 메모 (textarea)
- Day별 메모

### ⚙️ 설정 & 여행 관리
- 여행 이름, 이모지, 기간, 출발일(D-Day), 인원, 환율
- 동행자 이름 설정 (쉼표 구분 → 경비 정산에 사용)
- 테마 전환 (자동/라이트/다크)
- 여행 추가/삭제/전환
- 초기화: 설정 하단으로 이동, 2단계 확인 다이얼로그

### 🎨 UX/UI
- **다크 모드**: CSS Custom Properties, 라이트/다크/자동, 헤더 🌙/☀️ 토글
- **Compact header**: 스크롤 시 trip info 카드 축소 (이름 + D-Day만)
- **Sticky tab bar**: 스크롤해도 탭 고정, blur backdrop
- **Toast 알림**: 추가/수정/삭제 시 2초간 피드백
- **Dialog X 닫기**: 모든 다이얼로그 우상단 ✕ 버튼
- **Dialog scale-in**: 열릴 때 애니메이션
- **여행 공유**: 헤더 📋 → 일정 텍스트 클립보드 복사
- **D-Day 카운트다운**: 헤더 배지 (D-11, D-Day!, 여행 3일차)
- **Button press feedback**: active 시 scale(0.97)
- **Input focus glow**: coral box-shadow
- **Smooth scroll + overscroll containment**
- **Empty state CTA**: 빈 화면에 추가 안내 버튼

## 스토리지
- 여행 데이터: `tp-v6` → `{ trips: [...], aid: "현재선택ID" }`
- 테마: `tp-theme` → `"auto" | "light" | "dark"`
- 날씨 캐시: `tp-weather` → `{ data: [...], ts: timestamp }` (1시간 TTL)

## 코드 컨벤션
- 간격은 반드시 S 토큰 사용 (S.xs ~ S.xxl)
- 컬러는 반드시 T 토큰 사용 (CSS Custom Properties)
- 하드코딩된 px/color 값 사용 금지
- pill/chip row: `overflow: hidden` + `whiteSpace: nowrap` + `flexShrink: 0`
- 모든 label: `display: "block", marginBottom: S.xs`
- 폼 gap: S.md (12px), 아이템 gap: S.sm (8px)
- 조건부 렌더링: 삼항 연산자 `? :` 사용 (`&&` 지양)
- useMemo: 파생 값 계산 (budgetSummary, checklistSummary 등)
- 단일 패스 반복: 경비 집계 시 한 번의 루프로 모든 값 계산

## Research & Plans
- `.claude/research/travel-services-analysis.md` — 경쟁 서비스 분석, 기능 갭 분석, 구현 우선순위
- `.claude/research/ux-audit-and-improvement-plan.md` — UX 감사, P0-P2 이슈, 스프린트 계획, 디자인 원칙
