# 클로드 코드에 붙여넣을 프롬프트

아래 프롬프트를 클로드 코드 세션에서 한번에 붙여넣으면 됨.
프로젝트 폴더를 먼저 만들고 그 안에서 claude를 실행한 후 사용.

```bash
mkdir ~/travel-planner && cd ~/travel-planner && claude
```

---

## 프롬프트 (아래 전체를 복사해서 붙여넣기)

```
travel-planner 프로젝트를 처음부터 셋업해줘. 아래 순서대로 진행:

## 1. Vite + React 초기화
- `npm create vite@latest . -- --template react` 실행
- `npm install` 실행
- `npm install @radix-ui/react-dialog @radix-ui/react-switch` 실행
- `npm install -D prettier` 실행

## 2. Git + GitHub
- `git init`
- .gitignore 생성 (node_modules, dist, .env, .claude/settings.local.json, *.log)
- `gh repo create travel-planner --private --source=. --push` (gh CLI 없으면 안내만 해줘)

## 3. 소스코드 배치
첨부한 travel-planner.jsx 파일 내용을 src/App.jsx로 저장해줘.

단, 아래 수정사항 반영:
- window.storage → localStorage로 교체 (async/await 제거, 동기 방식으로)
- <style> 태그 안의 @import url(...) 두 줄 삭제 (폰트는 index.html에서 로드)
- shadcn/ui import를 @radix-ui 로 교체:
  - Dialog, DialogContent, DialogHeader, DialogTitle → @radix-ui/react-dialog
  - Switch → @radix-ui/react-switch
  - (Radix는 스타일이 없으니까 기존 인라인 스타일 유지하면서 Radix primitive로 래핑)

## 4. index.html 수정
<head> 안에 폰트 link 추가:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
```

## 5. CLAUDE.md 생성
프로젝트 루트에 CLAUDE.md를 생성해줘. 내용:

```markdown
# Travel Planner — React 웹앱

## 프로젝트 개요
효진+승민의 도쿄·하코네 4박5일 여행(2026.03.26~30)을 위한 React 여행 플래너.
향후 다른 여행에도 동일 포맷으로 재사용 가능한 범용 구조.

## 기술 스택
- React + Vite
- Radix UI (Dialog, Switch)
- 인라인 스타일 (디자인 토큰 기반)
- localStorage (persistent storage)
- Outfit + Pretendard 폰트

## 디자인 토큰
간격: S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 }
컬러: 코랄(#E07460), 인디고(#2D3561), 민트(#3EBCB4), 앰버(#E89B52), 바이올렛(#7056E0)
radius: T.r=14, T.rSm=10, pill=50
스타일: 글래스모피즘 blur(12px), 따뜻하고 귀여운 분위기

## 코드 컨벤션
- 간격은 S 토큰만 사용 (하드코딩 px 금지)
- pill/chip에 overflow:hidden + whiteSpace:nowrap + flexShrink:0
- label에 display:"block", marginBottom: S.xs 통일
- 폼 gap: S.md, 아이템 gap: S.sm

## 커맨드
- npm run dev: 개발 서버
- npm run build: 프로덕션 빌드
```

## 6. .claude 폴더 구조 생성

### .claude/settings.json (hooks)
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "file_path=$(jq -r '.tool_input.file_path // empty'); if [ -n \"$file_path\" ] && echo \"$file_path\" | grep -qE '\\.(jsx|tsx|js|ts|css)$'; then npx prettier --write \"$file_path\" 2>/dev/null; fi; exit 0"
          }
        ]
      }
    ]
  }
}
```

### .claude/skills/design-guard/SKILL.md
```markdown
---
name: design-guard
description: 디자인 토큰 위반을 검사하고 수정. 스타일 변경/UI 수정 후 사용.
---
grep으로 하드코딩된 gap/padding/margin/borderRadius/color 값을 탐지.
S 토큰(xs/sm/md/lg/xl/xxl)과 T 토큰으로 교체.
수정 후 재검증까지 수행.
```

### .claude/skills/add-feature/SKILL.md
```markdown
---
name: add-feature
description: 새 기능 추가 워크플로우. "기능 추가", "만들어줘" 시 자동 호출.
---
Step 1: 영향 분석 (어떤 파일, 새 state 필요 여부)
Step 2: 구현 계획 작성 후 사용자 확인
Step 3: 디자인 토큰 준수하며 구현
Step 4: 토큰 위반 검사
Step 5: CLAUDE.md 업데이트
```

### .claude/skills/update-trip/SKILL.md
```markdown
---
name: update-trip
description: 여행 데이터(일정/경비/체크리스트) 수정. 자연어로 요청 시 자동 호출.
---
DEF 상수에서 days/expenses/checklist 데이터를 $ARGUMENTS 기반으로 수정.
type: flight/transit/car/hotel/food/activity/cherry
cat(경비): 교통/숙소/식비/활동/기타
cat(체크): 예약/서류/준비/짐싸기
amt는 원화 기준, 엔화면 rate(9.29) 곱해서 변환.
```

### .claude/agents/ui-reviewer.md
```markdown
---
name: ui-reviewer
description: UI/UX 리뷰 전문 에이전트. 스타일 변경 후 호출.
allowed-tools: Read, Grep, Glob
---
모바일 우선 React 앱 리뷰어.
체크: 토큰 일관성, 터치타겟(44px), 텍스트 위계, pill 줄바꿈, 접근성.
심각도별 보고: 필수/권장/참고.
```

### .claude/commands/status.md
```markdown
---
description: 프로젝트 상태 요약
allowed-tools: Bash(wc:*), Bash(grep:*), Bash(find:*)
---
파일 구조, 줄 수, 200줄 초과 파일, 토큰 위반 수, TODO 항목을 요약 보고.
```

## 7. 동작 확인
- `npm run dev` 실행해서 빌드 에러 없는지 확인
- 에러 있으면 수정

## 8. 첫 커밋
- `git add .`
- `git commit -m "init: travel planner with vite + react"`
- `git push -u origin main` (GitHub 레포 연결된 경우)

전체 완료 후 /status 실행해서 프로젝트 상태 보고해줘.
```
