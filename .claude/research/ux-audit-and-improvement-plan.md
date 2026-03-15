# UI/UX Audit & Improvement Plan

> Last updated: 2026-03-15
> Perspective: Professional UI/UX designer audit
> Reference: 2025 mobile UX best practices, travel app competitive analysis

## Current State Assessment

### Strengths
- Warm, cohesive visual identity (coral/amber gradient, glassmorphism)
- Good information hierarchy (D-Day badge, tab counts)
- Emoji-based iconography is consistent and charming
- Dark mode support with CSS Custom Properties
- FAB for quick expense entry is convenient

### UX Issues (Priority Order)

---

## P0: Critical UX Problems

### 1. No Empty State Guidance
**Problem**: 새 여행 생성 시 빈 화면에 "일정이 없어요" 텍스트만 표시. 사용자가 뭘 해야 하는지 모름.
**Solution**: Empty state에 일러스트 + CTA 버튼 + 안내 문구
```
"여행 일정을 만들어보세요!"
[+ Day 추가] 버튼을 눈에 띄게
```

### 2. Reset Button Too Accessible
**Problem**: ↺ 리셋 버튼이 헤더에 노출. 실수로 누르면 전체 데이터 삭제. 확인 다이얼로그 없음.
**Solution**:
- 설정 다이얼로그 안으로 이동
- 2단계 확인 ("정말 초기화?" → "모든 데이터가 삭제됩니다" 경고)

### 3. Tab Bar Not Sticky
**Problem**: 스크롤하면 탭 바가 올라감. 긴 일정/경비 목록에서 탭 전환이 불편.
**Solution**: 탭 바를 sticky로 고정 (`position: sticky; top: 0; z-index: 10`)

### 4. No Feedback on Actions
**Problem**: 항목 추가/수정/삭제 시 시각적 피드백 없음. 성공했는지 불확실.
**Solution**:
- Toast/snackbar 알림 ("추가되었습니다", "삭제되었습니다")
- 또는 아이템 추가 시 highlight animation

---

## P1: Important UX Improvements

### 5. Trip Info Card Wastes Space
**Problem**: 헤더의 여행 정보 카드가 항상 큰 영역 차지. 스크롤 시에도 고정 안 됨.
**Solution**:
- 스크롤 시 compact header로 전환 (여행 이름 + D-Day만 표시)
- 또는 trip info를 collapsible로

### 6. FAB Overlaps Content
**Problem**: FAB(₩) 버튼이 하단 콘텐츠를 가림. paddingBottom: 100이지만 체크리스트 마지막 항목은 여전히 가려질 수 있음.
**Solution**:
- FAB를 경비 탭에서만 표시 (다른 탭에서는 불필요)
- 또는 bottom safe area 계산 개선

### 7. Dialog Accessibility
**Problem**: Dialog에 닫기 버튼(X) 없음. Overlay 탭으로만 닫을 수 있는데 직관적이지 않음.
**Solution**: Dialog 우상단에 X 닫기 버튼 추가

### 8. Expense List Information Density
**Problem**: 경비 아이템이 높이가 높아 한 화면에 3-4개만 보임. 확정 토글, 삭제 버튼이 모두 한 줄에 있어 복잡.
**Solution**:
- Compact view 옵션 (리스트 vs 카드)
- Swipe-to-delete (삭제 버튼 숨김)
- 확정 토글은 체크 아이콘 탭으로 충분

### 9. Checklist Category Visibility
**Problem**: 체크리스트 아이템의 카테고리가 텍스트 옆에 작은 회색 글씨. 구분이 어려움.
**Solution**: 카테고리별 색상 점(dot) 또는 좌측 accent bar (경비 탭처럼)

### 10. No Scroll-to-Today
**Problem**: "오늘" Day가 자동 펼침되지만, Day가 많으면 스크롤 위치가 맞지 않을 수 있음.
**Solution**: 오늘 Day로 자동 스크롤 (scrollIntoView)

---

## P2: Polish & Delight

### 11. Micro-interactions Missing
**Problem**: 전환/액션이 딱딱함. fadeIn만 있고 개별 요소 애니메이션 없음.
**Solution**:
- 체크박스 토글 시 체크 애니메이션
- 경비 추가 시 리스트 아이템 slide-in
- 탭 전환 시 content crossfade
- D-Day 배지 count-up 애니메이션

### 12. Typography Hierarchy Weak
**Problem**: 폰트 사이즈가 11-20px 범위에서 미세하게 다름. 명확한 계층 부족.
**Solution**: 타이포 스케일 정의
```
H1: 24px/800 (여행 이름)
H2: 18px/700 (섹션 제목)
H3: 14px/700 (카드 제목)
Body: 13px/400
Caption: 11px/600
Mini: 9px/700 (배지)
```

### 13. Color Contrast in Category Badges
**Problem**: 카테고리 pill의 텍스트가 작고 배경색과 대비가 약함 (특히 다크모드).
**Solution**: 배지에 미세한 border 추가 또는 텍스트를 bold로

### 14. Day Card Header Touch Target
**Problem**: Day 아코디언 헤더의 터치 영역이 시각적으로 불명확.
**Solution**: hover/active 시 배경색 변화 추가

### 15. No Pull-to-Refresh Feel
**Problem**: 웹앱이라 네이티브 앱 느낌 부족.
**Solution**:
- overscroll-behavior: contain
- 부드러운 스크롤 (scroll-behavior: smooth)
- 터치 피드백 (active state on buttons)

---

## Feature Addition Plan (from competitive analysis)

### Phase 1: Quick Wins (1-2 days each)
| # | Feature | Description | Impact |
|---|---|---|---|
| F1 | **경비 정산** | 누가 냈는지 기록 + 자동 정산 결과 | High |
| F2 | **여행 공유** | 일정을 텍스트/JSON으로 복사/공유 | High |
| F3 | **짐싸기 템플릿** | 일본여행 기본 체크리스트 원클릭 추가 | Medium |
| F4 | **Toast 알림** | 추가/수정/삭제 시 피드백 | Medium |

### Phase 2: Medium Effort (2-3 days each)
| # | Feature | Description | Impact |
|---|---|---|---|
| F5 | **Sticky Tab Bar** | 탭 고정 + compact header on scroll | High |
| F6 | **Empty State 개선** | 온보딩 가이드 + CTA | Medium |
| F7 | **여행 통계** | 여행 후 경비 리캡/요약 카드 | Medium |
| F8 | **Dialog X 버튼** | 접근성 개선 | Low |

### Phase 3: Ambitious (3-5 days each)
| # | Feature | Description | Impact |
|---|---|---|---|
| F9 | **날씨 정보** | OpenWeatherMap API 연동 | Medium |
| F10 | **Micro-interactions** | 체크 애니메이션, slide-in, crossfade | Medium |
| F11 | **지도 연동** | Google Maps embed 또는 장소 미리보기 | High (complex) |

---

## Recommended Implementation Order

```
Sprint 1 (UX Critical):
  P0-2 Reset 버튼 이동 + 확인 다이얼로그
  P0-3 Sticky Tab Bar
  P1-7 Dialog X 닫기 버튼
  F4   Toast 알림

Sprint 2 (Features):
  F1   경비 정산
  F2   여행 공유 (텍스트 복사)
  F3   짐싸기 템플릿

Sprint 3 (Polish):
  P0-1 Empty State 개선
  P1-6 FAB 조건부 표시
  P2-11 Micro-interactions
  P2-12 Typography 스케일 정리

Sprint 4 (Advanced):
  F5   Compact header on scroll
  F7   여행 통계/리캡
  F9   날씨 API 연동
```

## Design Principles (travel-mate)

1. **Warm & Personal**: 상업적 느낌 배제, 개인 여행 다이어리 감성 유지
2. **Glanceable**: 한눈에 중요 정보 파악 (D-Day, 오늘 일정, 체크 진행률)
3. **Thumb-friendly**: 주요 액션은 하단/중앙, 위험 액션은 깊이 숨기기
4. **Forgiving**: 실수 방지 (확인 다이얼로그) + 실수 복구 (undo)
5. **Delightful**: 작은 애니메이션과 이모지로 즐거운 사용감
