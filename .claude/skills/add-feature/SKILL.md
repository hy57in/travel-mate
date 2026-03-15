---
name: add-feature
description: |
  여행 플래너에 새 기능을 추가하는 구조화된 워크플로우.
  "기능 추가", "새로 만들어줘", "구현해줘" 시 자동 호출.
---

## 기능 추가: $ARGUMENTS

### Step 1: 영향 분석
- 어떤 탭/컴포넌트에 영향을 주는가?
- 새 state가 필요한가?
- storage 스키마 변경이 필요한가?
- 새 디자인 토큰이 필요한가?

분석 결과를 먼저 사용자에게 보고하고 확인받는다.

### Step 2: 구현 계획
수정할 파일 목록과 각 파일의 변경 요약을 작성한다:

```
[ ] 파일1.jsx — 변경 내용 요약
[ ] 파일2.jsx — 변경 내용 요약
```

### Step 3: 구현
- 디자인 토큰(S, T) 사용
- 기존 스타일 패턴 따르기 (glass, pill, inputStyle 등)
- 이모지 사용 (아이콘 라이브러리 X)
- pill/chip에 줄바꿈 방지 속성

### Step 4: 검증
```bash
npm run dev                    # 빌드 확인
grep -rn "gap: [0-9]" src/ --include="*.jsx" | grep -v "S\."  # 토큰 위반 검사
```

### Step 5: 문서 업데이트
CLAUDE.md의 "구현된 기능" 섹션에 새 기능 추가.
