---
name: design-guard
description: |
  디자인 토큰 위반을 검사하고 수정한다.
  스타일 변경, UI 수정, 새 컴포넌트 추가 후 사용.
  "토큰 검사", "스타일 체크", "디자인 규칙" 언급 시 자동 호출.
---

## 검사 항목

### 1단계: 하드코딩 탐지
다음 명령어를 실행해서 위반 사항을 찾는다:

```bash
# 간격 하드코딩 (S 토큰 미사용)
grep -rn "gap: [0-9]\|padding: [0-9]\|margin[A-Za-z]*: [0-9]" src/ --include="*.jsx" --include="*.tsx" | grep -v "S\.\|S\.xs\|S\.sm\|S\.md\|S\.lg\|S\.xl\|S\.xxl"

# border-radius 하드코딩 (T.r, T.rSm 미사용)
grep -rn "borderRadius: [0-9]" src/ --include="*.jsx" --include="*.tsx" | grep -v "T\.r\|T\.rSm\|50\|\"50%\""

# 컬러 하드코딩 (T 토큰 미사용)
grep -rn "color: \"#\|background: \"#" src/ --include="*.jsx" --include="*.tsx" | grep -v "T\.\|CAT\["
```

### 2단계: 위반 보고
발견된 항목을 테이블로 정리:

| 파일:줄 | 현재 값 | 교체해야 할 토큰 |
|---------|---------|-----------------|
| App.jsx:123 | gap: 10 | gap: S.md |

### 3단계: 자동 수정
사용자 확인 후 모든 위반을 토큰으로 교체.

### 교체 규칙
```
간격:
  4  → S.xs     8  → S.sm     12 → S.md
  16 → S.lg     20 → S.xl     24 → S.xxl

border-radius:
  14 → T.r      10 → T.rSm    50 → 50 (pill은 유지)

pill/chip 필수 속성:
  overflow: "hidden"
  whiteSpace: "nowrap"
  flexShrink: 0

label 필수 속성:
  display: "block"
  marginBottom: S.xs
```

### 4단계: 재검증
수정 후 1단계 명령어를 다시 실행해서 잔여 위반 0건 확인.
