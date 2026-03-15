---
name: update-trip
description: |
  여행 일정, 경비, 체크리스트 데이터를 수정한다.
  "일정 추가", "경비 수정", "체크리스트 업데이트" 시 자동 호출.
---

## 요청: $ARGUMENTS

### 데이터 위치
기본 데이터는 `DEF` 상수에 있다 (현재 단일 파일이면 travel-planner.jsx, 분리 후에는 src/data/defaults.js).

### 데이터 구조

일정 아이템:
```javascript
{ time: "14:00", text: "아키하바라", type: "activity", hl: false, skip: false, pend: false }
```

경비 아이템:
```javascript
{ id: 17, cat: "식비", name: "라멘", amt: 18580, ok: false }
// amt는 원화(₩), ok는 확정 여부
```

체크리스트 아이템:
```javascript
{ id: 23, cat: "준비", text: "와이파이 수령", done: false }
```

### 수정 규칙
- id는 기존 최대값 + 1
- 경비 amt는 원화 기준. 엔화로 말하면 환율(rate: 9.29) 곱해서 변환
- type은: flight, transit, car, hotel, food, activity, cherry 중 선택
- cat은: 교통, 숙소, 식비, 활동, 기타 중 선택 (경비) / 예약, 서류, 준비, 짐싸기 중 선택 (체크리스트)

### 수정 후
변경 사항을 요약해서 보여준다.
