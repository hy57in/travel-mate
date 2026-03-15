# Travel Services Research (2025-2026)

> Last updated: 2026-03-15
> Sources: Exa web search (Wanderlog, TripIt, Triple, travel app guides)

## Competitive Landscape

### Global Apps
| App | Strength | Key Features |
|---|---|---|
| **Wanderlog** | Visual trip planning | Map view with pins, collaborative editing, offline access, budget tracking, auto-import bookings, place lists |
| **TripIt** | Booking organizer | Auto-parse emails to build itinerary, real-time flight alerts, airport maps, sharing |
| **Tineo** | AI-powered | AI itinerary generation, personalized recommendations |
| **Plan Harmony** | Group trips | Voting on activities, shared expense splitting, group polls |
| **TripCache** | Lightweight | Quick itinerary builder, simple sharing |
| **Spark Trip** | AI + Budget | AI suggestions, budget tracking, collaborative |

### Korean Apps
| App | Strength | Key Features |
|---|---|---|
| **Triple (트리플)** | All-in-one | AI 일정 생성, 지도 동선 시각화, 배낭톡(실시간 채팅), 경비 관리, 예약 통합, 날씨 정보, 맛집 추천 |
| **MyRealTrip (마이리얼트립)** | 예약 중심 | 항공/숙소/투어 예약, 현지 체험, 가이드 투어 |
| **NOL (야놀자)** | 숙소 특화 | 숙소 예약, 레저 티켓, 국내/해외 |
| **Klook (클룩)** | 액티비티 | 투어/티켓 예약, 교통패스, 현지 체험 |

### Utility Apps
| App | Category | Key Feature |
|---|---|---|
| **PackPoint** | Packing | Weather-based packing list generation |
| **PackItSmart** | Packing | Shared checklist, family trips, weather forecast |
| **XE Currency** | Finance | Real-time exchange rates |
| **Google Maps** | Navigation | Offline maps, saved places, route planning |
| **Papago/DeepL** | Translation | Real-time translation, camera translation |

## Common Feature Matrix (Top Apps)

### Must-Have (모든 주요 앱에 존재)
- [x] Day-by-day itinerary
- [x] Budget/expense tracking
- [x] Checklist
- [x] Notes/memo
- [x] Dark mode

### High-Value (대부분의 앱에 존재)
- [ ] Map integration (장소 핀, 동선 시각화)
- [ ] Weather forecast (여행일 날씨)
- [ ] Real-time currency rates (환율 자동 업데이트)
- [ ] Trip sharing (URL 공유)
- [ ] Expense split/settlement (경비 정산)
- [ ] Photo attachment (Day별 사진)

### Medium-Value (차별화 기능)
- [ ] Packing list templates (날씨 기반 추천)
- [ ] Travel timeline/progress visualization
- [ ] Travel stats/recap (여행 후 요약)
- [ ] Transportation links (길찾기 연동)
- [ ] Offline support
- [ ] Document storage (여권, 예약확인서 사진)

### Advanced (소수 앱에 존재)
- [ ] AI itinerary generation
- [ ] Booking auto-import (이메일 파싱)
- [ ] Real-time collaboration
- [ ] Flight status alerts
- [ ] Nearby place recommendations

## Feature Gap Analysis (travel-mate vs. competitors)

travel-mate가 이미 가진 것: itinerary, budget, checklist, memo, dark mode, DnD, Day tagging

### 가장 임팩트 높은 미구현 기능 (우선순위 순)

1. **경비 정산 (Expense Settlement)**
   - 누가 얼마 냈는지 기록 → 자동 정산
   - 트리플, Wanderlog, Plan Harmony 모두 지원
   - travel-mate는 이미 travelers 수 있음 → 확장 용이

2. **여행 공유 (Trip Sharing)**
   - JSON export → URL 공유 (읽기 전용)
   - 또는 clipboard에 텍스트 일정 복사
   - 대부분의 경쟁앱 기본 제공

3. **날씨 정보 (Weather Forecast)**
   - startDate 기반으로 여행일 날씨 표시
   - OpenWeatherMap 무료 API 사용 가능
   - 트리플의 핵심 기능

4. **지도 연동 (Map Integration)**
   - 장소 URL 이미 있음 → Google Maps embed 또는 링크 강화
   - Day별 장소를 지도에 핀으로 표시
   - Wanderlog/트리플의 가장 큰 강점

5. **짐싸기 템플릿 (Packing Templates)**
   - 기존 체크리스트에 "짐싸기" 카테고리 있음
   - 일본여행 기본 템플릿 제공 → 원클릭 추가
   - PackPoint/PackItSmart 참고

6. **여행 통계 (Trip Stats/Recap)**
   - 여행 후: 총 경비, 카테고리 비율, 체크리스트 완료율 등
   - 여행 전: D-Day 카운트다운 (이미 있음)

7. **문서 보관 (Document Storage)**
   - 여권, 항공권, 호텔 예약확인서 사진 저장
   - localStorage 용량 제한 있으므로 링크/메모 형태가 현실적

## Implementation Feasibility (travel-mate 기준)

| Feature | Complexity | API 필요 | localStorage OK | Priority |
|---|---|---|---|---|
| 경비 정산 | Low | No | Yes | P0 |
| 여행 공유 (텍스트/JSON) | Low | No | N/A | P0 |
| 짐싸기 템플릿 | Low | No | Yes | P1 |
| 여행 통계 | Medium | No | Yes | P1 |
| 날씨 정보 | Medium | Yes (free) | Cache | P2 |
| 지도 연동 | Medium-High | Yes (Maps) | N/A | P2 |
| 문서 보관 | Low | No | Links only | P3 |
