# Travel Planner — React 웹앱

## 프로젝트 개요
효진+승민의 도쿄·하코네 4박5일 여행(2026.03.26~30)을 위한 React 여행 플래너.
향후 다른 여행에도 동일 포맷으로 재사용 가능한 범용 구조.

## 기술 스택
- **빌드**: Vite 8 + React 19
- **UI 라이브러리**: @radix-ui/react-dialog, @dnd-kit (드래그앤드롭)
- **지도**: @vis.gl/react-google-maps (Google Maps JavaScript API)
- **DB**: Supabase (PostgreSQL + Realtime + Auth)
- **스토리지**: Supabase (온라인) + localStorage 폴백 (`tp-v6` 키)
- **AI**: Claude API via Cloudflare Worker 프록시
- **스타일링**: 인라인 스타일 (CSS Custom Properties 기반 디자인 토큰)
- **색상 팔레트**: Soft Blossom (coral #F47B6E, amber #FFAD6B, mint #4ECDC4, violet #8B5CF6)
- **폰트**: Outfit (Google Fonts) + Pretendard (한글, CDN)
- **아이콘**: 이모지 (외부 아이콘 라이브러리 미사용)
- **패키지 매니저**: pnpm
- **배포**: Cloudflare Workers (`npx wrangler deploy`)
- **배포 URL**: https://travel-mate.gywls00100.workers.dev

## 아키텍처

### 파일 구조
```
src/
├── App.jsx              # 메인 앱 (라우팅, 다이얼로그, 레이아웃)
├── tokens.js            # 디자인 토큰 (S, T, CAT, THEME_LIGHT/DARK)
├── styles.js            # 공통 스타일 (glass, pill, inputStyle, btnPrimary)
├── storage.js           # localStorage 래퍼
├── lib/
│   └── supabase.js      # Supabase 클라이언트
├── utils/
│   └── geocode.js       # Nominatim 지오코딩 (캐시 포함)
├── data/
│   └── defaults.js      # 기본 여행 데이터 (좌표 포함)
├── hooks/
│   ├── useTrips.js      # 여행 CRUD, Supabase 실시간 동기화, localStorage 폴백
│   ├── useTheme.js      # 다크모드 (auto/light/dark)
│   ├── useWeather.js    # 날씨 예보 (wttr.in API, 1시간 캐시)
│   ├── useAuth.js       # Supabase 인증 (Google OAuth + 매직링크)
│   ├── useAI.js         # Claude API 호출 (Cloudflare Worker 프록시)
│   └── useSupabaseTrips.js  # Supabase 전용 trips 훅
└── components/
    ├── ItineraryTab.jsx  # 일정 탭 (DnD + 타임라인 뷰 토글, Day 관리, 날씨)
    ├── BudgetTab.jsx     # 경비 탭 (도넛, 바 차트, 정산, Day 소계)
    ├── ChecklistTab.jsx  # 체크리스트 탭 (DnD, 템플릿, 카테고리 색상)
    ├── MapTab.jsx        # 지도 탭 (Google Maps, 장소 검색, 동선, Day 필터)
    ├── MemoTab.jsx       # 메모 탭 + 여행 리캡 카드
    ├── forms/
    │   ├── ItemForm.jsx     # 일정 추가/수정 (장소 검색, 상태 pill)
    │   ├── AddExpForm.jsx   # 경비 추가 (결제자 선택)
    │   ├── ExpInline.jsx    # 경비 인라인 편집
    │   ├── QuickExp.jsx     # FAB 빠른 지출 입력
    │   ├── AddChkForm.jsx   # 체크리스트 추가
    │   ├── ChkInline.jsx    # 체크리스트 인라인 편집
    │   ├── AddTripForm.jsx  # 새 여행 추가
    │   ├── SettingsForm.jsx # 여행 설정 (동행자, 테마, 로그아웃, 초기화)
    │   ├── AITripForm.jsx   # AI 일정 생성
    │   └── LoginForm.jsx    # 로그인 (Google + 매직링크)
    └── ui/
        ├── Donut.jsx        # SVG 도넛 차트
        ├── BarChart.jsx     # Day별 경비 막대 차트
        ├── Timeline.jsx     # 세로 타임라인 시각화
        ├── TripRecap.jsx    # 여행 요약 인포그래픽
        ├── DayMap.jsx       # (미사용, MapTab으로 대체)
        ├── Empty.jsx        # 빈 상태 + CTA 버튼
        ├── Toast.jsx        # Toast 알림 시스템
        └── ToggleSwitch.jsx # 토글 스위치

workers/
└── ai-proxy/            # Claude API 프록시 (Cloudflare Worker)
    ├── wrangler.toml
    └── src/index.js

supabase/
└── schema.sql           # DB 스키마 (trips, trip_members, RLS)
```

### Custom Hooks
- **useTrips**: 여행 CRUD + Supabase 실시간 동기화 + localStorage 폴백
- **useAuth**: Google OAuth + 매직링크 인증
- **useTheme**: CSS Custom Properties 기반 테마 전환
- **useWeather**: wttr.in API → Day 헤더에 날씨 이모지 + 온도 표시
- **useAI**: Cloudflare Worker → Claude API 일정 생성

## 디자인 시스템

### 간격 토큰 (4px 그리드)
```javascript
const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
```

### 컬러 — Soft Blossom 팔레트 (CSS Custom Properties)
```
코랄: #F47B6E (포인트)     코랄라이트: #FDE9E6
인디고: #2B2D42 (텍스트)   민트: #4ECDC4 (식비/확정)
앰버: #FFAD6B (숙소/예상)  바이올렛: #8B5CF6 (활동)
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
- **뷰 토글**: 리스트 뷰 (⠿ DnD) ↔ 타임라인 뷰 (📋 세로 시각화)
- 타임라인: 세로 라인 + 시간 점 + 핵심/다음 일정 하이라이트
- 드래그앤드롭 순서 변경 (⠿ 핸들, @dnd-kit, PointerSensor 5px + TouchSensor 200ms)
- 시간순 정렬 버튼
- Day 추가/삭제/제목·날짜 인라인 편집
- 장소 검색: Nominatim API로 좌표 자동 검색 + localStorage 캐시
- 📍 장소찾기: Day별 일괄 좌표 검색
- 📍 링크 → 구글맵에서 장소명 검색
- 오늘의 일정: 자동 펼치기/스크롤, "오늘" 배지, 다음 일정 민트 하이라이트
- 날씨 예보: wttr.in API, Day 헤더에 이모지 + 온도 (5일 이내)
- Empty state CTA

### 💰 경비 탭
- 인디고 서머리 카드 + SVG 도넛 차트
- **Day별 경비 막대 차트** (BarChart)
- 확정/예상 구분, 1인당 자동 계산
- 카테고리 필터 + 컬러 legend (다크모드 border 대비)
- 인라인 편집 (이름, 금액, 카테고리, Day, 결제자)
- ₩↔¥ 통화 토글
- Day 태깅 + Day별 소계 카드
- 경비 정산: 결제자(paidBy) 기록 → 자동 정산 결과 ("A → B에게 ₩X 보내기")
- FAB (₩ 버튼): 경비 탭에서만 표시, 빠른 지출 입력
- CSV 다운로드
- Compact 경비 리스트 (이름 상단 + 배지 하단)
- Empty state CTA

### ✅ 체크리스트 탭
- 진행률 프로그레스 바
- 카테고리 필터 + **카테고리 색상 점** (예약=coral, 서류=indigo, 준비=mint, 짐싸기=amber)
- 드래그앤드롭 순서 변경 (필터 적용 시에도 정상 동작)
- 인라인 편집, 추가/삭제
- 짐싸기 템플릿: 🧳 버튼으로 일본여행 기본 12개 아이템 원클릭 추가 (중복 방지)
- 체크 애니메이션 (check-pop)
- Empty state CTA

### 🗺️ 지도 탭
- **Google Maps** (한국어 레이블, `@vis.gl/react-google-maps`)
- **장소 검색**: 오버레이 검색바 → 핀 표시 → "D1에 추가" 버튼
- **동선 표시**: Day별 색상 경로선 + 방향 화살표
- **Day 필터**: 지도 하단 오버레이 pill (전체/D1/D2...)
- **핀 클릭** → 지도 아래 상세 카드 슬라이드인 (InfoWindow 아님)
- **구글맵 열기**: 장소명으로 검색 (좌표가 아닌 이름)
- **일괄 좌표 찾기**: "📍 모든 일정의 장소 자동 찾기" 버튼
- 일정 순서 변경 시 지도 자동 반영
- Day별 색상 범례

### 📝 메모 탭
- 전체 여행 메모 (textarea)
- Day별 메모
- **여행 리캡 카드**: 기간/장소 수/총 경비/1인당/준비 완료율 인포그래픽

### ⚙️ 설정 & 여행 관리
- 여행 이름, 이모지, 기간, 출발일(D-Day), 인원, 환율
- 동행자 이름 설정 (쉼표 구분 → 경비 정산에 사용)
- 테마 전환 (자동/라이트/다크)
- 여행 추가/삭제/전환
- **AI 일정 생성**: ✨ 버튼 → 목적지/일수/스타일 → Claude API로 자동 생성
- 로그인 상태 표시 + 로그아웃 버튼
- 초기화: 설정 하단, 2단계 확인 다이얼로그

### 🔐 인증 & 동기화
- **Google OAuth** + **이메일 매직링크** 로그인
- **Supabase Realtime**: 한 명이 수정하면 다른 사용자 화면에 즉시 반영
- **오프라인 폴백**: Supabase 미설정/미로그인 시 localStorage 모드
- **자동 마이그레이션**: 첫 로그인 시 localStorage → Supabase 이전
- RLS 정책: trip 소유자/멤버만 접근 가능

### 🎨 UX/UI
- **다크 모드**: CSS Custom Properties, 라이트/다크/자동, 헤더 🌙/☀️ 토글
- **Compact header**: 스크롤 시 trip info 카드 축소 (이름 + D-Day만)
- **D-Day 위젯**: 여행 중 "다음: 14:00 장소" 미리보기
- **Sticky tab bar**: 스크롤해도 탭 고정, blur backdrop
- **Toast 알림**: 추가/수정/삭제 시 2초간 피드백 (중앙 정렬)
- **Dialog**: X 닫기 버튼, scale-in 애니메이션 (translate 유지)
- **여행 공유**: 헤더 📋 → 일정 텍스트 클립보드 복사
- **D-Day 카운트다운**: 헤더 배지 (D-11, D-Day!, 여행 3일차)
- **로그인 배너**: 탭 아래 콘텐츠 영역에 표시
- **Button press feedback**: active 시 scale(0.97)
- **Input focus glow**: coral box-shadow
- **Day 헤더 터치 피드백**: active 배경 변화
- **Smooth scroll + overscroll containment**
- **Empty state CTA**: 빈 화면에 추가 안내 버튼
- **Micro-interactions**: fadeIn, slideIn, scaleIn, checkPop 애니메이션

## 스토리지
- **Supabase** (온라인): `trips` 테이블 (JSONB), `trip_members` (공유)
- **localStorage 폴백**: `tp-v6` → `{ trips: [...], aid: "현재선택ID" }`
- 테마: `tp-theme` → `"auto" | "light" | "dark"`
- 날씨 캐시: `tp-weather` → `{ data: [...], ts: timestamp }` (1시간 TTL)
- 지오코딩 캐시: `tp-geocache` → `{ "장소명": { lat, lng } }`

## 환경변수 (.env.local)
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_GOOGLE_MAPS_KEY=AIza...
VITE_AI_URL=https://travel-mate-ai.xxx.workers.dev
```

## 배포
```bash
pnpm build              # .env.local의 VITE_ 변수가 빌드에 포함됨
npx wrangler deploy     # Cloudflare Workers에 배포
```

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
