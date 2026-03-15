---
name: migrate
description: |
  아티팩트 환경(.jsx)을 독립 Vite React 앱으로 마이그레이션한다.
  한 번만 실행하는 작업.
invocation: user
---

## 마이그레이션 순서

### Phase 1: 프로젝트 초기화
```bash
npm create vite@latest . -- --template react
npm install
```

### Phase 2: 의존성 설치
```bash
npm install @radix-ui/react-dialog @radix-ui/react-switch
npm install -D prettier
```

### Phase 3: 스토리지 교체
`window.storage` API → localStorage:

```javascript
// Before (아티팩트)
const stOk = () => typeof window !== "undefined" && window.storage && typeof window.storage.get === "function";
async function load() { const r = await window.storage.get("tp-v6"); return r?.value ? JSON.parse(r.value) : null; }
async function save(d) { await window.storage.set("tp-v6", JSON.stringify(d)); }

// After (표준 웹)
function load() {
  try { const d = localStorage.getItem("tp-v6"); return d ? JSON.parse(d) : null; }
  catch { return null; }
}
function save(d) {
  try { localStorage.setItem("tp-v6", JSON.stringify(d)); } catch {}
}
```

- async/await 제거 (localStorage는 동기)
- useEffect 내 load 호출도 동기로 변경
- persist 함수도 동기로 단순화

### Phase 4: 폰트 이동
`<style>` 태그 안의 @import → `index.html`의 `<head>`로:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" rel="stylesheet">
```

### Phase 5: 컴포넌트 분리
`/split-component` 스킬 실행.

### Phase 6: 최종 검증
```bash
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run preview  # 프로덕션 프리뷰
```

모든 탭(일정/경비/체크리스트/메모)과 기능(추가/편집/삭제/정렬/CSV) 동작 확인.
