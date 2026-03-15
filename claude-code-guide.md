# 클로드 코드 에이전트 활용 가이드

여행 플래너 프로젝트를 클로드 코드에서 개발할 때 활용하면 좋은 기능들.

---

## 1. 프로젝트 초기 셋업

### CLAUDE.md (필수)
프로젝트 루트에 `CLAUDE.md`를 두면 클로드 코드가 **세션 시작 시 자동으로 읽는다.**
위에서 만든 CLAUDE.md를 프로젝트 루트에 넣으면 됨.

```bash
# 프로젝트 시작
mkdir travel-planner && cd travel-planner
npx create-vite . --template react
# CLAUDE.md를 루트에 복사
# travel-planner.jsx를 src/ 안에 배치
```

### /init 명령어
클로드 코드에서 `/init`을 실행하면 프로젝트를 분석해서 CLAUDE.md를 자동 생성해줌.
이미 만든 CLAUDE.md가 있으면 그걸 기반으로 보완해달라고 하면 됨.

---

## 2. 추천 Hooks

Hooks = 클로드 코드의 특정 이벤트에 자동으로 실행되는 셸 명령어.
`.claude/settings.json`에 설정하거나, 클로드 코드 안에서 `/hooks`로 인터랙티브하게 설정 가능.

### (1) PostToolUse — 파일 수정 후 자동 포맷팅
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          {
            "type": "command",
            "command": "npx prettier --write \"$(jq -r '.tool_input.file_path' /dev/stdin)\""
          }
        ]
      }
    ]
  }
}
```
클로드가 파일 수정할 때마다 Prettier가 자동 실행 → 코드 스타일 일관성 유지.

### (2) PostToolUse — 타입체크 자동 실행 (TypeScript로 전환 시)
```json
{
  "PostToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "npx tsc --noEmit 2>&1 | tail -5"
        }
      ]
    }
  ]
}
```

### (3) PreToolUse — 중요 파일 보호
```json
{
  "PreToolUse": [
    {
      "matcher": "Edit|Write",
      "hooks": [
        {
          "type": "command",
          "command": "python3 -c \"import json,sys; d=json.load(sys.stdin); p=d.get('tool_input',{}).get('file_path',''); sys.exit(2 if '.env' in p or 'package-lock' in p else 0)\""
        }
      ]
    }
  ]
}
```

### (4) Notification — 데스크톱 알림 (macOS)
```json
{
  "Notification": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "osascript -e 'display notification \"클로드 코드가 입력을 기다립니다\" with title \"Claude Code\"'"
        }
      ]
    }
  ]
}
```
장시간 작업 중 클로드가 질문하거나 작업 끝나면 알림이 옴.

---

## 3. 추천 Skills (= Custom Slash Commands)

Skills = 재사용 가능한 프롬프트 묶음. `.claude/skills/<이름>/SKILL.md`에 생성.
`/이름`으로 직접 호출하거나, 클로드가 상황에 맞게 자동 호출.

### (1) /design-token — 디자인 토큰 규칙 강제
```
.claude/skills/design-token/SKILL.md
```
```markdown
---
name: design-token
description: 디자인 토큰 규칙을 적용할 때 사용. 스타일 수정, 간격/컬러 변경 시 자동 호출.
---

이 프로젝트의 디자인 토큰 규칙:

1. **간격**: 반드시 S 토큰 사용 (S.xs=4, S.sm=8, S.md=12, S.lg=16, S.xl=20, S.xxl=24)
   - 하드코딩된 px 값 절대 사용 금지
2. **border-radius**: T.r (14px) 또는 T.rSm (10px) 사용
3. **컬러**: T 객체의 값만 사용 (T.coral, T.indigo 등)
4. **pill/chip**: overflow: hidden + whiteSpace: nowrap + flexShrink: 0 필수
5. **label**: display: "block", marginBottom: S.xs 통일

수정 후 반드시 `grep -n "gap: [0-9]" <파일>` 로 하드코딩 잔여 확인.
```

### (2) /component-split — 컴포넌트 분리 가이드
```markdown
---
name: component-split
description: 단일 파일을 여러 컴포넌트로 분리할 때 사용.
---

현재 단일 .jsx 파일을 다음 구조로 분리:

```
src/
  components/
    ItineraryTab.jsx
    BudgetTab.jsx
    ChecklistTab.jsx
    MemoTab.jsx
    forms/
      ItemForm.jsx
      ExpInline.jsx
      ChkInline.jsx
      QuickExp.jsx
      AddExpForm.jsx
      AddChkForm.jsx
      AddTripForm.jsx
      SettingsForm.jsx
    ui/
      Donut.jsx
      Empty.jsx
  tokens.js          # S, T, CAT, TYPES 등
  styles.js           # glass, pill, inputStyle 등
  storage.js          # load, save 함수
  data/defaults.js    # DEF 기본 데이터
  App.jsx             # 메인 조합
```

분리 시 주의:
- tokens.js와 styles.js를 먼저 분리하고, 나머지가 import
- storage.js의 window.storage → localStorage로 교체
- 각 컴포넌트는 200줄 이하 유지
```

### (3) /migrate-storage — 스토리지 마이그레이션
```markdown
---
name: migrate-storage
description: window.storage API를 localStorage로 마이그레이션할 때 사용.
---

아티팩트 환경의 window.storage를 표준 웹 API로 교체:

1. `window.storage.get(key)` → `localStorage.getItem(key)` + JSON.parse
2. `window.storage.set(key, value)` → `localStorage.setItem(key, JSON.stringify(value))`
3. stOk() 함수 → typeof window !== "undefined" 체크만으로 단순화
4. async/await 제거 가능 (localStorage는 동기)
5. 기존 tp-v6 키 유지하되, 마이그레이션 로직 추가 (이전 버전 데이터 호환)
```

---

## 4. 추천 Slash Commands (간단한 작업용)

`.claude/commands/<이름>.md` 형태. Skills보다 가볍게 사용.

### /check-tokens — 하드코딩 검사
```markdown
---
description: 하드코딩된 스타일 값 검사
allowed-tools: Bash(grep:*)
---

다음 명령어로 하드코딩된 간격/스타일 값을 찾아서 보고해줘:

```bash
grep -rn "gap: [0-9]\|padding: [0-9]\|margin.*: [0-9]" src/ --include="*.jsx" --include="*.tsx" | grep -v "S\.\|T\."
```

발견된 항목을 S/T 토큰으로 교체 방안과 함께 알려줘.
```

### /travel-data — 여행 데이터 업데이트
```markdown
---
description: 여행 일정/경비/체크리스트 데이터 업데이트
argument-hint: [변경 내용]
---

DEF 상수(기본 여행 데이터)에서 $ARGUMENTS 내용을 반영해서 수정해줘.
기존 데이터 구조(days, expenses, checklist)를 유지하면서 업데이트.
```

---

## 5. 서브에이전트 활용

`.claude/agents/<이름>.md`에 전문 에이전트 정의.
메인 클로드가 필요시 자동으로 위임.

### design-reviewer.md
```markdown
---
name: design-reviewer
description: UI/UX 디자인 리뷰 전문 에이전트. 스타일 변경 후 호출.
allowed-tools: Read, Grep, Glob
---

당신은 모바일 우선 React 앱의 UI/UX 디자인 리뷰어입니다.

리뷰 기준:
1. 디자인 토큰 일관성 (S, T 객체 사용 여부)
2. 모바일 터치 타겟 (최소 44px)
3. 텍스트 가독성 (폰트 크기, 대비)
4. 줄바꿈/오버플로 방지 (pill, chip 등)
5. 접근성 기본 (색상 대비, 터치 영역)

발견된 이슈를 심각도별로 정리해서 보고.
```

---

## 6. 실전 워크플로우 예시

```bash
# 1. 프로젝트 셋업
cd travel-planner
claude

# 2. 세션 시작하면 CLAUDE.md가 자동 로드됨
# 3. 컴포넌트 분리 작업
> /component-split

# 4. 스토리지 마이그레이션
> /migrate-storage

# 5. 새 기능 추가
> Day 추가/삭제 기능을 만들어줘. 설정 탭에서 관리.

# 6. 디자인 토큰 검사
> /check-tokens

# 7. 컨텍스트가 길어지면
> /compact  # 또는 /clear 후 새 작업 시작
```

---

## 7. 유용한 팁

- **`/clear`를 자주 쓸 것** — 새 작업 시작할 때마다. 토큰 절약 + 정확도 향상.
- **`/compact`** — 기존 맥락 유지하면서 토큰 줄이기.
- **`/context`** — 현재 컨텍스트 사용량 확인. 스킬이 너무 많으면 경고 뜸.
- **`@파일명`** — 특정 파일을 컨텍스트에 직접 추가.
- **`--dangerously-skip-permissions`** — 권한 확인 스킵 (자동화 모드, 주의해서 사용).
- **`/install-github-app`** — GitHub PR 자동 리뷰 설정.

---

## 8. 추천 MCP 서버

프로젝트에 맞게 연결하면 좋은 MCP 서버들:

- **Context7** (`context7`) — 라이브러리 최신 문서 자동 조회. React, shadcn/ui 등의 최신 API 확인에 유용.
- **GitHub** — 이슈/PR 관리 자동화.
- **Figma** — 디자인 시안이 있으면 코드 변환에 활용.

```bash
# MCP 서버 추가
claude /mcp
# → 인터랙티브 메뉴에서 추가
```

---

## 9. 프로젝트 디렉토리 구조 (최종 목표)

```
travel-planner/
├── CLAUDE.md                    # 프로젝트 컨텍스트 (자동 로드)
├── .claude/
│   ├── settings.json            # hooks 설정
│   ├── skills/
│   │   ├── design-token/SKILL.md
│   │   ├── component-split/SKILL.md
│   │   └── migrate-storage/SKILL.md
│   ├── commands/
│   │   ├── check-tokens.md
│   │   └── travel-data.md
│   └── agents/
│       └── design-reviewer.md
├── src/
│   ├── App.jsx
│   ├── components/...
│   ├── tokens.js
│   ├── styles.js
│   ├── storage.js
│   └── data/defaults.js
├── public/
├── package.json
└── vite.config.js
```
