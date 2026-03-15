---
name: split-component
description: |
  단일 JSX 파일을 여러 컴포넌트 파일로 분리한다.
  "컴포넌트 분리", "파일 나누기", "리팩토링" 시 사용.
invocation: user
---

## 분리 순서 (의존성 역순)

### Phase 1: 공유 모듈 (다른 모든 파일이 import)
1. `src/tokens.js` — S, T, CAT, EC, CC, TYPES, TYPE_EMOJI, fmt, toY, toK
2. `src/styles.js` — glass, pill, inputStyle, btnPrimary, btnOutline (tokens.js import)
3. `src/storage.js` — stOk, load, save

### Phase 2: 독립 컴포넌트 (서로 의존 없음)
4. `src/components/ui/Donut.jsx` — Donut 차트
5. `src/components/ui/Empty.jsx` — 빈 상태 표시

### Phase 3: 폼 컴포넌트 (tokens, styles import)
6. `src/components/forms/ItemForm.jsx`
7. `src/components/forms/ExpInline.jsx`
8. `src/components/forms/ChkInline.jsx`
9. `src/components/forms/QuickExp.jsx`
10. `src/components/forms/AddExpForm.jsx`
11. `src/components/forms/AddChkForm.jsx`
12. `src/components/forms/AddTripForm.jsx`
13. `src/components/forms/SettingsForm.jsx`

### Phase 4: 탭 컴포넌트 (폼 + ui import)
14. `src/components/ItineraryTab.jsx`
15. `src/components/BudgetTab.jsx`
16. `src/components/ChecklistTab.jsx`
17. `src/components/MemoTab.jsx`

### Phase 5: 조합
18. `src/App.jsx` — state + 탭 조합 + 다이얼로그 + FAB

## 분리 규칙
- 각 파일 상단에 필요한 import만 추가
- props 타입은 JSDoc 주석으로 명시
- 각 컴포넌트 200줄 이하 유지
- export default 사용
- Phase별로 진행하고 매 Phase 후 `npm run dev`로 동작 확인

## 검증
각 Phase 완료 후:
```bash
npm run dev          # 빌드 에러 확인
# 브라우저에서 해당 탭 동작 테스트
```
