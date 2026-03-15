import { useState, useEffect, useCallback, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Switch from "@radix-ui/react-switch";

/* ═══ DESIGN TOKENS ═══ */
const S = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24 };
const T = {
  coral: "#E07460", coralLight: "#FDE8E4", peach: "#FFF5F0",
  indigo: "#2D3561", indigoLight: "#E8EAF6",
  mint: "#3EBCB4", mintLight: "#E0F5F3",
  amber: "#E89B52", amberLight: "#FFF2E0",
  violet: "#7056E0", violetLight: "#EDE7FF",
  sand: "#FAF6F1", cream: "#FFFCF9",
  text: "#1A1A2E", textSoft: "#636A78", textMuted: "#9CA3AF",
  glass: "rgba(255,255,255,0.82)", glassBorder: "rgba(0,0,0,0.06)",
  shadow: "0 2px 12px rgba(45,53,97,0.07)",
  shadowLg: "0 8px 28px rgba(45,53,97,0.10)",
  r: 14, rSm: 10,
};

const CAT = {
  "교통": { color: T.indigo, bg: T.indigoLight, emoji: "🚃" },
  "숙소": { color: T.amber, bg: T.amberLight, emoji: "🏨" },
  "식비": { color: T.mint, bg: T.mintLight, emoji: "🍽️" },
  "활동": { color: T.violet, bg: T.violetLight, emoji: "⭐" },
  "기타": { color: T.textSoft, bg: "#F3F4F6", emoji: "📦" },
};
const EC = Object.keys(CAT);
const CC = ["전체", "예약", "서류", "준비", "짐싸기"];
const TYPES = [
  { v: "flight", emoji: "✈️", l: "항공" }, { v: "transit", emoji: "🚃", l: "교통" },
  { v: "car", emoji: "🚗", l: "차량" }, { v: "hotel", emoji: "🏨", l: "숙소" },
  { v: "food", emoji: "🍽️", l: "식사" }, { v: "activity", emoji: "⭐", l: "활동" },
  { v: "cherry", emoji: "🌸", l: "벚꽃" },
];
const TYPE_EMOJI = Object.fromEntries(TYPES.map(t => [t.v, t.emoji]));
const fmt = n => n.toLocaleString("ko-KR");
const toY = (k, r) => Math.round(k / r);
const toK = (y, r) => Math.round(y * r);

/* ═══ STORAGE ═══ */
function load() { try { const d = localStorage.getItem("tp-v6"); return d ? JSON.parse(d) : null; } catch { return null; } }
function save(d) { try { localStorage.setItem("tp-v6", JSON.stringify(d)); } catch {} }

/* ═══ STYLES ═══ */
const glass = { background: T.glass, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", border: `1px solid ${T.glassBorder}`, borderRadius: T.r, boxShadow: T.shadow };
const pill = (active) => ({
  padding: "6px 14px", borderRadius: 50, fontSize: 12, fontWeight: 600, cursor: "pointer", border: "none", transition: "all 0.2s",
  background: active ? T.indigo : "rgba(255,255,255,0.7)", color: active ? "#fff" : T.textSoft,
  whiteSpace: "nowrap", flexShrink: 0,
});
const inputStyle = { borderRadius: T.rSm, border: `1.5px solid #E5E7EB`, padding: "10px 14px", fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.85)", fontFamily: "inherit", transition: "border-color 0.15s" };
const btnPrimary = { background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", border: "none", borderRadius: T.rSm, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%" };
const btnOutline = { background: "transparent", color: T.textSoft, border: `1.5px solid #E5E7EB`, borderRadius: T.rSm, padding: "10px 16px", fontSize: 13, cursor: "pointer" };

/* ═══ DEFAULT DATA ═══ */
const DEF = [{
  id: "tokyo-hakone-2026", name: "도쿄·하코네", emoji: "🗼",
  dates: "2026.03.26 ~ 03.30", startDate: "2026-03-26", travelers: 2, rate: 9.29,
  memo: "효진+승민 도쿄·하코네 4박 5일\n\n📌 핵심\n- 겐카사카구라 앱 쿠폰 꼭 제시\n- 하코네: 오와쿠다니+하코네진자 필수\n- 렌터카 1박 (Day2~3 오전)",
  days: [
    { date: "3/26 (목)", title: "도착 + 벚꽃 + 사케", memo: "", items: [
      { time: "08:45", text: "ICN 출발 (YP731)", type: "flight" },
      { time: "11:20", text: "나리타 도착", type: "flight" },
      { time: "14:00", text: "N'EX → 신주쿠", type: "transit" },
      { time: "14:30", text: "선루트 플라자 체크인", type: "hotel" },
      { time: "15:00", text: "시모키타자와 빈티지 쇼핑", type: "activity" },
      { time: "16:00", text: "신주쿠교엔 벚꽃 ¥500", type: "cherry" },
      { time: "18:00", text: "겐카사카구라 총본점 #112769", type: "food", hl: true },
    ]},
    { date: "3/27 (금)", title: "렌터카 후지산 + 하코네", memo: "렌터카 07:00 픽업 야와라기빌딩\n선루트에서 도보 12~15분", items: [
      { time: "07:00", text: "렌터카 픽업", type: "car" },
      { time: "08:40", text: "추레이토 파고다", type: "activity", skip: true },
      { time: "10:00", text: "카와구치코 호토", type: "food", skip: true },
      { time: "12:00", text: "오와쿠다니 검은 달걀 ★", type: "activity", hl: true },
      { time: "13:30", text: "하코네진자 도리이 ★", type: "activity", hl: true },
      { time: "15:00", text: "nol hakone 체크인", type: "hotel" },
      { time: "17:00", text: "온천 + 료칸 저녁", type: "food" },
    ]},
    { date: "3/28 (토)", title: "카구라자카 + 칸아가리", memo: "", items: [
      { time: "09:00", text: "렌터카 신주쿠 복귀", type: "car" },
      { time: "11:00", text: "그레이스리 짐 맡기기", type: "hotel" },
      { time: "12:00", text: "카구라자카 산책 + 런치", type: "activity" },
      { time: "15:00", text: "호텔 휴식", type: "hotel" },
      { time: "17:30", text: "칸아가리 예약 완료", type: "food", hl: true },
      { time: "20:00", text: "골든가이", type: "activity" },
    ]},
    { date: "3/29 (일)", title: "해리포터 + 기치조지", memo: "", items: [
      { time: "08:30", text: "토시마엔역", type: "transit" },
      { time: "09:30", text: "해리포터 스튜디오 #2352384", type: "activity", hl: true },
      { time: "14:00", text: "기치조지 하모니카요코초", type: "activity" },
      { time: "14:30", text: "이노카시라 공원 벚꽃", type: "cherry" },
      { time: "17:00", text: "스시 오마카세 (TBD)", type: "food", pend: true },
    ]},
    { date: "3/30 (월)", title: "귀국", memo: "", items: [
      { time: "08:00", text: "체크아웃", type: "hotel" },
      { time: "09:00", text: "N'EX → 나리타", type: "transit" },
      { time: "12:30", text: "NRT 출발 (YP732)", type: "flight" },
      { time: "15:10", text: "ICN 도착", type: "flight" },
    ]},
  ],
  expenses: [
    { id: 1, cat: "교통", name: "항공권 왕복", amt: 734800, ok: true },
    { id: 2, cat: "숙소", name: "선루트 1박", amt: 375931, ok: true },
    { id: 3, cat: "숙소", name: "nol hakone 1박", amt: 776087, ok: true },
    { id: 4, cat: "숙소", name: "그레이스리 2박", amt: 1043665, ok: true },
    { id: 5, cat: "교통", name: "렌터카 1박", amt: 193989, ok: true },
    { id: 6, cat: "활동", name: "해리포터 2인", amt: 130200, ok: true },
    { id: 7, cat: "식비", name: "칸아가리 2인", amt: 111381, ok: true },
    { id: 8, cat: "교통", name: "N'EX 왕복", amt: 75600, ok: false },
    { id: 9, cat: "교통", name: "Suica 5일", amt: 65000, ok: false },
    { id: 10, cat: "교통", name: "톨+주유", amt: 139200, ok: false },
    { id: 11, cat: "식비", name: "겐카사카구라", amt: 66900, ok: false },
    { id: 12, cat: "식비", name: "D3 런치", amt: 46400, ok: false },
    { id: 13, cat: "식비", name: "골든가이", amt: 55700, ok: false },
    { id: 14, cat: "식비", name: "D4 간식", amt: 27900, ok: false },
    { id: 15, cat: "식비", name: "기타 5일", amt: 92900, ok: false },
    { id: 16, cat: "활동", name: "신주쿠교엔", amt: 9300, ok: false },
  ],
  checklist: [
    { id: 1, cat: "예약", text: "항공권", done: true },
    { id: 2, cat: "예약", text: "선루트 호텔", done: true },
    { id: 3, cat: "예약", text: "nol hakone 료칸", done: true },
    { id: 4, cat: "예약", text: "그레이스리", done: true },
    { id: 5, cat: "예약", text: "겐카사카구라 #112769", done: true },
    { id: 6, cat: "예약", text: "칸아가리 17:30", done: true },
    { id: 7, cat: "예약", text: "해리포터 #2352384", done: true },
    { id: 8, cat: "예약", text: "닛폰렌터카 1박", done: true },
    { id: 9, cat: "서류", text: "IDP", done: true },
    { id: 10, cat: "준비", text: "겐카사카구라 앱 쿠폰", done: false },
    { id: 11, cat: "준비", text: "환전 3~5만엔", done: false },
    { id: 12, cat: "준비", text: "eSIM/와이파이", done: false },
    { id: 13, cat: "예약", text: "스시 오마카세", done: false },
    { id: 14, cat: "서류", text: "여권", done: false },
    { id: 15, cat: "서류", text: "면허증 원본", done: false },
    { id: 16, cat: "준비", text: "보조배터리", done: false },
    { id: 17, cat: "짐싸기", text: "방수 자켓", done: false },
    { id: 18, cat: "짐싸기", text: "히트텍", done: false },
    { id: 19, cat: "짐싸기", text: "방수 스니커즈", done: false },
    { id: 20, cat: "짐싸기", text: "우산 ×2", done: false },
    { id: 21, cat: "짐싸기", text: "알디콤", done: false },
    { id: 22, cat: "짐싸기", text: "캐리어 ×2 + 폴딩백", done: false },
  ],
}];

/* ═══ MINI DONUT ═══ */
function Donut({ data, size = 72 }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  let cum = 0;
  const r = size / 2, ir = r - 9;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {data.map((d, i) => {
        const pct = total > 0 ? d.value / total : 0;
        const start = cum * 2 * Math.PI - Math.PI / 2;
        cum += pct;
        const end = cum * 2 * Math.PI - Math.PI / 2;
        const large = pct > 0.5 ? 1 : 0;
        const x1 = r + ir * Math.cos(start), y1 = r + ir * Math.sin(start);
        const x2 = r + ir * Math.cos(end), y2 = r + ir * Math.sin(end);
        return pct > 0.001 ? <path key={i} d={`M${r},${r} L${x1},${y1} A${ir},${ir} 0 ${large} 1 ${x2},${y2} Z`} fill={d.color} opacity={0.85} /> : null;
      })}
      <circle cx={r} cy={r} r={ir - 5} fill="white" />
    </svg>
  );
}

/* ═══ SWITCH HELPER ═══ */
function ToggleSwitch({ checked, onCheckedChange }) {
  return (
    <Switch.Root checked={checked} onCheckedChange={onCheckedChange} style={{width:42,height:25,backgroundColor:checked?"#E07460":"#ccc",borderRadius:50,position:"relative",border:"none",cursor:"pointer"}}>
      <Switch.Thumb style={{display:"block",width:21,height:21,backgroundColor:"white",borderRadius:"50%",transition:"transform 0.1s",transform:checked?"translateX(17px)":"translateX(2px)",marginTop:2}} />
    </Switch.Root>
  );
}

/* ═══ MAIN APP ═══ */
export default function App() {
  const [trips, setTrips] = useState(DEF);
  const [aid, setAid] = useState(DEF[0].id);
  const [loading, setLoading] = useState(true);
  const [exDay, setExDay] = useState(0);
  const [ckF, setCkF] = useState("전체");
  const [exF, setExF] = useState("전체");
  const [tab, setTab] = useState("itinerary");
  const [dlg, setDlg] = useState(null);
  const [fab, setFab] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [editExp, setEditExp] = useState(null);
  const [editChk, setEditChk] = useState(null);

  useEffect(() => {
    const data = load();
    if (data?.trips?.length) { setTrips(data.trips); setAid(data.aid || data.trips[0]?.id); }
    setLoading(false);
  }, []);

  const persist = useCallback((nt, na) => { setTrips(nt); if (na) setAid(na); save({ trips: nt, aid: na || aid }); }, [aid]);
  const trip = trips?.find(t => t.id === aid);
  const ut = useCallback(u => { persist(trips.map(t => t.id === aid ? { ...t, ...u } : t)); }, [trips, aid, persist]);
  const reset = () => { setTrips(DEF); setAid(DEF[0].id); save({ trips: DEF, aid: DEF[0].id }); };
  const nid = arr => Math.max(0, ...arr.map(x => x.id)) + 1;

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}><div style={{ width: 28, height: 28, border: `3px solid ${T.coralLight}`, borderTop: `3px solid ${T.coral}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /></div>;
  if (!trip) return null;

  const dday = trip.startDate ? Math.ceil((new Date(trip.startDate) - new Date()) / 86400000) : null;
  const ddayText = dday === null ? "" : dday > 0 ? `D-${dday}` : dday === 0 ? "D-Day!" : `여행 ${-dday}일차`;

  const okAmt = trip.expenses.filter(e => e.ok).reduce((s, e) => s + e.amt, 0);
  const estAmt = trip.expenses.filter(e => !e.ok).reduce((s, e) => s + e.amt, 0);
  const tot = okAmt + estAmt;
  const pp = Math.round(tot / (trip.travelers || 2));
  const ckDone = trip.checklist.filter(c => c.done).length;
  const ckTot = trip.checklist.length;
  const ckPct = ckTot > 0 ? Math.round((ckDone / ckTot) * 100) : 0;
  const fExp = exF === "전체" ? trip.expenses : trip.expenses.filter(e => e.cat === exF);
  const fChk = ckF === "전체" ? trip.checklist : trip.checklist.filter(c => c.cat === ckF);
  const catT = {}; trip.expenses.forEach(e => { catT[e.cat] = (catT[e.cat] || 0) + e.amt; });
  const donutData = Object.entries(catT).map(([c, v]) => ({ color: CAT[c]?.color || "#999", value: v, label: c }));

  const sortDay = (di) => {
    const day = trip.days[di];
    const sorted = [...day.items].sort((a, b) => {
      const p = t => { const s = t.replace(/[~：]/g, "").trim(); const m = s.match(/(\d{1,2}):(\d{2})/); return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 9999; };
      return p(a.time) - p(b.time);
    });
    const nd = [...trip.days]; nd[di] = { ...day, items: sorted }; ut({ days: nd });
  };

  const moveItem = (di, ii, dir) => {
    const day = trip.days[di];
    const ni = ii + dir;
    if (ni < 0 || ni >= day.items.length) return;
    const items = [...day.items];
    [items[ii], items[ni]] = [items[ni], items[ii]];
    const nd = [...trip.days]; nd[di] = { ...day, items }; ut({ days: nd });
  };

  const exportCSV = () => {
    const rows = [["카테고리", "항목", "원", "엔", "확정"]];
    trip.expenses.forEach(e => rows.push([e.cat, e.name, e.amt, toY(e.amt, trip.rate), e.ok ? "Y" : "N"]));
    rows.push([], ["", "합계", tot, toY(tot, trip.rate)], ["", "1인당", pp, toY(pp, trip.rate)]);
    const b = new Blob(["\uFEFF" + rows.map(r => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(b), download: `${trip.name}_경비.csv` }).click();
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", background: `linear-gradient(180deg, ${T.peach} 0%, ${T.cream} 30%, ${T.sand} 100%)`, fontFamily: "'Outfit', 'Pretendard', -apple-system, sans-serif", paddingBottom: 100, position: "relative" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 4px 16px rgba(224,116,96,0.25); } 50% { transform: scale(1.04); box-shadow: 0 6px 24px rgba(224,116,96,0.4); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease-out; }
        input:focus, textarea:focus { border-color: ${T.coral} !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: `${S.xxl}px ${S.xl}px ${S.lg}px` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
          <div style={{ display: "flex", alignItems: "center", gap: S.sm, overflow: "hidden" }}>
            {trips.map(t => <button key={t.id} style={pill(t.id === aid)} onClick={() => { setAid(t.id); setExDay(0); }}>{t.emoji} {t.name}</button>)}
            <button style={{ ...pill(false), border: "1.5px dashed #ccc", padding: "5px 10px" }} onClick={() => setDlg({ type: "trip" })}>＋</button>
          </div>
          <div style={{ display: "flex", gap: S.xs, flexShrink: 0 }}>
            <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: S.xs }} onClick={() => setDlg({ type: "settings" })}>⚙️</button>
            <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: S.xs, color: T.textMuted }} onClick={reset}>↺</button>
          </div>
        </div>

        <div style={{ ...glass, padding: `${S.lg}px ${S.xl}px`, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: S.sm }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{trip.emoji} {trip.name}</div>
            <div style={{ fontSize: 12, color: T.textSoft, marginTop: S.xs }}>{trip.dates} · {trip.travelers}인 · ¥1=₩{trip.rate}</div>
          </div>
          {ddayText && <div style={{ background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", borderRadius: T.rSm, padding: `${S.sm}px ${S.lg}px`, fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>{ddayText}</div>}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ padding: `0 ${S.xl}px` }}>
        <div style={{ display: "flex", gap: S.xs, ...glass, padding: S.xs }}>
          {[
            { v: "itinerary", emoji: "📅", l: "일정" },
            { v: "budget", emoji: "💰", l: "경비" },
            { v: "checklist", emoji: "✅", l: `체크 ${ckDone}/${ckTot}` },
            { v: "memo", emoji: "📝", l: "메모" },
          ].map(t => (
            <button key={t.v} onClick={() => setTab(t.v)} style={{
              flex: 1, padding: "10px 0", borderRadius: T.rSm, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
              background: tab === t.v ? "#fff" : "transparent", color: tab === t.v ? T.text : T.textMuted,
              boxShadow: tab === t.v ? "0 1px 6px rgba(0,0,0,0.06)" : "none",
            }}>{t.emoji} {t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: `${S.lg}px ${S.xl}px 0` }}>

        {/* ═══ ITINERARY ═══ */}
        {tab === "itinerary" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
            {trip.days.map((day, di) => {
              const open = exDay === di;
              return (
                <div key={di} style={{ ...glass, overflow: "hidden", transition: "all 0.2s" }}>
                  <button onClick={() => setExDay(open ? -1 : di)} style={{ width: "100%", textAlign: "left", padding: `${S.lg}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.md, border: "none", background: "transparent", cursor: "pointer" }}>
                    <div style={{ background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", borderRadius: T.rSm, minWidth: 44, height: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1, letterSpacing: 0.5 }}>DAY</span>
                      <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{di + 1}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{day.title}</div>
                      <div style={{ fontSize: 11, color: T.textSoft, marginTop: S.xs }}>{day.date}</div>
                    </div>
                    <span style={{ fontSize: 18, color: T.textMuted, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
                  </button>

                  {open && (
                    <div style={{ padding: `0 ${S.lg}px ${S.lg}px` }}>
                      {day.memo && <div style={{ fontSize: 11, color: T.textSoft, background: T.peach, borderRadius: T.rSm, padding: `${S.sm}px ${S.md}px`, marginBottom: S.md, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{day.memo}</div>}

                      <div style={{ display: "flex", flexDirection: "column", gap: S.xs }}>
                        {day.items.map((item, ii) => (
                          <div key={ii} style={{ display: "flex", alignItems: "center", gap: S.sm, padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, transition: "all 0.15s", background: item.hl ? T.coralLight : item.pend ? T.amberLight : "transparent", borderLeft: item.hl ? `3px solid ${T.coral}` : item.pend ? `3px solid ${T.amber}` : "3px solid transparent", opacity: item.skip ? 0.5 : 1 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                              <button onClick={() => moveItem(di, ii, -1)} style={{ background: "none", border: "none", cursor: ii === 0 ? "default" : "pointer", fontSize: 10, color: ii === 0 ? T.glassBorder : T.textMuted, padding: "1px 4px", lineHeight: 1 }}>▲</button>
                              <button onClick={() => moveItem(di, ii, 1)} style={{ background: "none", border: "none", cursor: ii === day.items.length - 1 ? "default" : "pointer", fontSize: 10, color: ii === day.items.length - 1 ? T.glassBorder : T.textMuted, padding: "1px 4px", lineHeight: 1 }}>▼</button>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: S.sm, flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setDlg({ type: "item", dayIdx: di, itemIdx: ii })}>
                              <div style={{ width: 34, height: 34, borderRadius: S.sm, background: item.hl ? `linear-gradient(135deg, ${T.coral}, ${T.amber})` : "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                                {TYPE_EMOJI[item.type] || "📍"}
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: item.pend ? T.amber : item.skip ? T.textMuted : T.text, textDecoration: item.skip ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</div>
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: S.sm, marginTop: S.md }}>
                        <button onClick={() => sortDay(di)} style={{ flex: 1, padding: `${S.sm}px 0`, borderRadius: T.rSm, border: `1.5px solid #e5e7eb`, background: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, color: T.textSoft, cursor: "pointer" }}>⏱ 시간순</button>
                        <button onClick={() => setDlg({ type: "item", dayIdx: di, isNew: true })} style={{ flex: 1, padding: `${S.sm}px 0`, borderRadius: T.rSm, border: `1.5px dashed ${T.coral}`, background: T.coralLight, fontSize: 12, fontWeight: 600, color: T.coral, cursor: "pointer" }}>＋ 추가</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {!trip.days.length && <Empty emoji="📅" text="일정이 없어요" />}
          </div>
        )}

        {/* ═══ BUDGET ═══ */}
        {tab === "budget" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.lg }}>
            <div style={{ background: `linear-gradient(135deg, ${T.indigo}, #4A3F8F)`, borderRadius: T.r, padding: S.xl, color: "#fff", boxShadow: "0 6px 24px rgba(45,53,97,0.18)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 600 }}>총 예상 경비</div>
                  <div style={{ fontSize: 26, fontWeight: 800, marginTop: S.xs, fontVariantNumeric: "tabular-nums" }}>₩{fmt(tot)}</div>
                  <div style={{ fontSize: 12, opacity: 0.6, marginTop: S.xs }}>¥{fmt(toY(tot, trip.rate))}</div>
                </div>
                <Donut data={donutData} size={72} />
              </div>
              <div style={{ display: "flex", gap: S.lg, marginTop: S.md, fontSize: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: S.xs }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.mint, display: "inline-block" }} />확정 ₩{fmt(okAmt)}</span>
                <span style={{ display: "flex", alignItems: "center", gap: S.xs }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: T.amber, display: "inline-block" }} />예상 ₩{fmt(estAmt)}</span>
              </div>
              <div style={{ marginTop: S.md, background: "rgba(255,255,255,0.12)", borderRadius: S.sm, padding: `${S.sm}px ${S.md}px`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>1인당</span>
                <span style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>₩{fmt(pp)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: S.sm, overflow: "hidden" }}>
              {Object.entries(catT).map(([c, a]) => {
                const ct = CAT[c] || CAT["기타"];
                const pct = tot > 0 ? Math.round((a / tot) * 100) : 0;
                return <span key={c} style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: ct.bg, color: ct.color, whiteSpace: "nowrap" }}>{ct.emoji} {c} {pct}%</span>;
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: S.xs, overflow: "hidden" }}>
                {["전체", ...EC].map(c => <button key={c} style={pill(exF === c)} onClick={() => setExF(c)}>{c}</button>)}
              </div>
              <div style={{ display: "flex", gap: S.sm, flexShrink: 0 }}>
                <button onClick={exportCSV} style={{ ...btnOutline, padding: "6px 10px", fontSize: 12 }}>📥</button>
                <button onClick={() => setDlg({ type: "addExp" })} style={{ ...pill(false), border: `1.5px dashed ${T.coral}`, color: T.coral }}>＋ 추가</button>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
              {fExp.map(e => {
                const ct = CAT[e.cat] || CAT["기타"];
                if (editExp === e.id) return <div key={e.id} style={{ ...glass, padding: S.lg }}><ExpInline e={e} rate={trip.rate} onSave={upd => { ut({ expenses: trip.expenses.map(x => x.id === e.id ? { ...x, ...upd } : x) }); setEditExp(null); }} onCancel={() => setEditExp(null)} /></div>;
                return (
                  <div key={e.id} style={{ ...glass, padding: `${S.md}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, borderLeft: `4px solid ${ct.color}`, cursor: "pointer" }} onClick={() => setEditExp(e.id)}>
                    <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", flexShrink: 0 }} onClick={ev => { ev.stopPropagation(); ut({ expenses: trip.expenses.map(x => x.id === e.id ? { ...x, ok: !x.ok } : x) }); }}>
                      {e.ok ? "✅" : "⭕"}
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: ct.bg, color: ct.color, flexShrink: 0 }}>{ct.emoji} {e.cat}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.name}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>₩{fmt(e.amt)}</div>
                      <div style={{ fontSize: 10, color: T.textMuted }}>¥{fmt(toY(e.amt, trip.rate))}</div>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.textMuted, flexShrink: 0 }} onClick={ev => { ev.stopPropagation(); setConfirmDel({ msg: `"${e.name}" 삭제?`, onOk: () => ut({ expenses: trip.expenses.filter(x => x.id !== e.id) }) }); }}>🗑</button>
                  </div>
                );
              })}
            </div>
            {!fExp.length && <Empty emoji="💰" text="경비가 없어요" />}
          </div>
        )}

        {/* ═══ CHECKLIST ═══ */}
        {tab === "checklist" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.lg }}>
            <div style={{ ...glass, padding: S.xl }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: S.sm }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: T.text }}>{ckPct}%</span>
                <span style={{ fontSize: 12, color: T.textSoft }}>{ckDone}/{ckTot} 완료</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "#eee", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${T.coral}, ${T.amber})`, width: `${ckPct}%`, transition: "width 0.3s" }} />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: S.xs, overflow: "hidden" }}>{CC.map(c => <button key={c} style={pill(ckF === c)} onClick={() => setCkF(c)}>{c}</button>)}</div>
              <button onClick={() => setDlg({ type: "addChk" })} style={{ ...pill(false), border: `1.5px dashed ${T.coral}`, color: T.coral, flexShrink: 0 }}>＋</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: S.sm }}>
              {fChk.map(c => {
                if (editChk === c.id) return <div key={c.id} style={{ ...glass, padding: S.lg }}><ChkInline c={c} onSave={upd => { ut({ checklist: trip.checklist.map(x => x.id === c.id ? { ...x, ...upd } : x) }); setEditChk(null); }} onCancel={() => setEditChk(null)} /></div>;
                return (
                  <div key={c.id} style={{ ...glass, padding: `${S.md}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, opacity: c.done ? 0.5 : 1 }}>
                    <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }} onClick={() => ut({ checklist: trip.checklist.map(x => x.id === c.id ? { ...x, done: !x.done } : x) })}>{c.done ? "☑️" : "⬜"}</button>
                    <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setEditChk(c.id)}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: c.done ? T.textMuted : T.text, textDecoration: c.done ? "line-through" : "none" }}>{c.text}</span>
                      <span style={{ fontSize: 10, color: T.textMuted, marginLeft: S.sm, fontWeight: 600 }}>{c.cat}</span>
                    </div>
                    <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.textMuted }} onClick={() => setConfirmDel({ msg: `"${c.text}" 삭제?`, onOk: () => ut({ checklist: trip.checklist.filter(x => x.id !== c.id) }) })}>🗑</button>
                  </div>
                );
              })}
            </div>
            {!fChk.length && <Empty emoji="✅" text="체크리스트 비어있어요" />}
          </div>
        )}

        {/* ═══ MEMO ═══ */}
        {tab === "memo" && (
          <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
            <div style={{ ...glass, padding: S.lg }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: S.sm }}>📝 전체 메모</div>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: "none", lineHeight: 1.7 }} value={trip.memo || ""} onChange={e => ut({ memo: e.target.value })} placeholder="여행 전체 메모..." />
            </div>
            {trip.days.map((day, di) => (
              <div key={di} style={{ ...glass, padding: S.lg }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: S.sm }}>Day {di + 1} · {day.date}</div>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: "none", lineHeight: 1.7 }} value={day.memo || ""} onChange={e => { const nd = [...trip.days]; nd[di] = { ...day, memo: e.target.value }; ut({ days: nd }); }} placeholder="메모..." />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <div style={{ position: "fixed", bottom: S.xxl, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: S.md, zIndex: 50 }}>
        {fab && <div style={{ ...glass, width: 300, padding: S.lg, boxShadow: T.shadowLg }} className="fade-in"><QuickExp rate={trip.rate} onAdd={exp => { ut({ expenses: [...trip.expenses, { ...exp, id: nid(trip.expenses) }] }); setFab(false); }} onClose={() => setFab(false)} /></div>}
        <button onClick={() => setFab(!fab)} style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", fontSize: 22, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(224,116,96,0.25)", animation: fab ? "none" : "pulse 2s infinite" }}>{fab ? "✕" : "₩"}</button>
      </div>

      {/* ── DIALOGS ── */}
      <Dialog.Root open={!!dlg} onOpenChange={() => setDlg(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:999}} />
          <Dialog.Content style={{ maxWidth: 380, borderRadius: T.r + 4, padding: S.xxl, position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"white",zIndex:1000,width:"90vw" }}>
          {dlg?.type === "item" && <>
            <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>{dlg.isNew ? "📌 일정 추가" : "✏️ 일정 수정"}</Dialog.Title></div>
            <ItemForm item={dlg.isNew ? null : trip.days[dlg.dayIdx]?.items[dlg.itemIdx]}
              onSave={item => { const nd = [...trip.days]; if (dlg.isNew) nd[dlg.dayIdx] = { ...nd[dlg.dayIdx], items: [...nd[dlg.dayIdx].items, item] }; else { const ni = [...nd[dlg.dayIdx].items]; ni[dlg.itemIdx] = item; nd[dlg.dayIdx] = { ...nd[dlg.dayIdx], items: ni }; } ut({ days: nd }); setDlg(null); }}
              onDelete={dlg.isNew ? null : () => setConfirmDel({ msg: "삭제할까요?", onOk: () => { const nd = [...trip.days]; nd[dlg.dayIdx] = { ...nd[dlg.dayIdx], items: nd[dlg.dayIdx].items.filter((_, i) => i !== dlg.itemIdx) }; ut({ days: nd }); setDlg(null); } })} />
          </>}
          {dlg?.type === "addExp" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>💰 경비 추가</Dialog.Title></div><AddExpForm rate={trip.rate} onAdd={exp => { ut({ expenses: [...trip.expenses, { ...exp, id: nid(trip.expenses) }] }); setDlg(null); }} /></>}
          {dlg?.type === "addChk" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>✅ 체크리스트 추가</Dialog.Title></div><AddChkForm onAdd={item => { ut({ checklist: [...trip.checklist, { ...item, id: nid(trip.checklist), done: false }] }); setDlg(null); }} /></>}
          {dlg?.type === "settings" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>⚙️ 여행 설정</Dialog.Title></div><SettingsForm trip={trip} onSave={upd => { ut(upd); setDlg(null); }} /></>}
          {dlg?.type === "trip" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>🌏 여행 관리</Dialog.Title></div>
            <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
              {trips.map(t => <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 600 }}><span>{t.emoji} {t.name}</span>{trips.length > 1 && <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }} onClick={() => { const nt = trips.filter(x => x.id !== t.id); persist(nt, t.id === aid ? nt[0].id : aid); }}>🗑</button>}</div>)}
              <div style={{ height: 1, background: "#eee" }} />
              <AddTripForm onAdd={t => { const nt = { ...t, id: `trip-${Date.now()}`, days: [], expenses: [], checklist: [], memo: "", rate: t.rate || 9.29 }; persist([...trips, nt], nt.id); setDlg(null); }} />
            </div></>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!confirmDel} onOpenChange={() => setConfirmDel(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:999}} />
          <Dialog.Content style={{ maxWidth: 300, borderRadius: T.r + 4, padding: S.xxl, textAlign: "center", position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"white",zIndex:1000,width:"90vw" }}>
            <p style={{ fontSize: 14, color: T.text, margin: `${S.md}px 0 ${S.xl}px` }}>{confirmDel?.msg}</p>
            <div style={{ display: "flex", gap: S.sm }}>
              <button style={{ ...btnOutline, flex: 1 }} onClick={() => setConfirmDel(null)}>취소</button>
              <button style={{ ...btnPrimary, flex: 1, background: "#EF4444" }} onClick={() => { confirmDel?.onOk(); setConfirmDel(null); }}>삭제</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

/* ═══ SUBCOMPONENTS ═══ */
function Empty({ emoji, text }) {
  return <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}><div style={{ fontSize: 36, marginBottom: 8 }}>{emoji}</div><div style={{ fontSize: 13, fontWeight: 600 }}>{text}</div></div>;
}

function ItemForm({ item, onSave, onDelete }) {
  const [time, setTime] = useState(item?.time || ""); const [text, setText] = useState(item?.text || ""); const [type, setType] = useState(item?.type || "activity");
  const [hl, setHl] = useState(item?.hl || false); const [skip, setSkip] = useState(item?.skip || false); const [pend, setPend] = useState(item?.pend || false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ display: "flex", gap: S.sm }}>
        <div style={{ width: 80 }}><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>시간</label><input style={inputStyle} value={time} onChange={e => setTime(e.target.value)} placeholder="09:00" /></div>
        <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>내용</label><input style={inputStyle} value={text} onChange={e => setText(e.target.value)} placeholder="장소/활동" /></div>
      </div>
      <div style={{ display: "flex", gap: S.xs, flexWrap: "wrap" }}>{TYPES.map(t => <button key={t.v} style={{ ...pill(type === t.v), fontSize: 12, padding: "5px 10px" }} onClick={() => setType(t.v)}>{t.emoji} {t.l}</button>)}</div>
      <div style={{ display: "flex", gap: S.lg, fontSize: 12, color: T.textSoft }}>
        <label style={{ display: "flex", alignItems: "center", gap: S.xs }}><ToggleSwitch checked={hl} onCheckedChange={setHl} />핵심</label>
        <label style={{ display: "flex", alignItems: "center", gap: S.xs }}><ToggleSwitch checked={skip} onCheckedChange={setSkip} />스킵</label>
        <label style={{ display: "flex", alignItems: "center", gap: S.xs }}><ToggleSwitch checked={pend} onCheckedChange={setPend} />미정</label>
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        <button style={{ ...btnPrimary, flex: 1 }} disabled={!time || !text} onClick={() => onSave({ time, text, type, hl, skip, pend })}>{item ? "수정" : "추가"}</button>
        {onDelete && <button style={{ ...btnOutline, color: "#EF4444", borderColor: "#FCA5A5" }} onClick={onDelete}>삭제</button>}
      </div>
    </div>
  );
}

function ExpInline({ e, rate, onSave, onCancel }) {
  const [name, setName] = useState(e.name); const [amt, setAmt] = useState(String(e.amt)); const [yen, setYen] = useState(String(toY(e.amt, rate))); const [cat, setCat] = useState(e.cat); const [mode, setMode] = useState("krw");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} />
      <div style={{ display: "flex", gap: S.sm, alignItems: "center" }}>
        <button style={pill(mode === "krw")} onClick={() => setMode("krw")}>₩</button>
        <button style={pill(mode === "yen")} onClick={() => setMode("yen")}>¥</button>
        {mode === "krw" ? <input type="number" style={{ ...inputStyle, flex: 1 }} value={amt} onChange={ev => { setAmt(ev.target.value); setYen(String(toY(Number(ev.target.value), rate))); }} />
          : <input type="number" style={{ ...inputStyle, flex: 1 }} value={yen} onChange={ev => { setYen(ev.target.value); setAmt(String(toK(Number(ev.target.value), rate))); }} />}
      </div>
      <div style={{ display: "flex", gap: S.xs }}>{EC.map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11, padding: "4px 10px" }} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div style={{ display: "flex", gap: S.sm }}><button style={{ ...btnPrimary, flex: 1 }} onClick={() => onSave({ name, amt: Number(amt), cat })}>저장</button><button style={{ ...btnOutline, flex: 0 }} onClick={onCancel}>취소</button></div>
    </div>
  );
}

function ChkInline({ c, onSave, onCancel }) {
  const [text, setText] = useState(c.text); const [cat, setCat] = useState(c.cat);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <input style={inputStyle} value={text} onChange={e => setText(e.target.value)} />
      <div style={{ display: "flex", gap: S.xs }}>{CC.filter(c => c !== "전체").map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11, padding: "4px 10px" }} onClick={() => setCat(c)}>{c}</button>)}</div>
      <div style={{ display: "flex", gap: S.sm }}><button style={{ ...btnPrimary, flex: 1 }} onClick={() => onSave({ text, cat })}>저장</button><button style={{ ...btnOutline }} onClick={onCancel}>취소</button></div>
    </div>
  );
}

function QuickExp({ rate, onAdd, onClose }) {
  const [name, setName] = useState(""); const [val, setVal] = useState(""); const [mode, setMode] = useState("yen"); const [cat, setCat] = useState("식비");
  const ref = useRef(null); useEffect(() => { ref.current?.focus(); }, []);
  const submit = () => { if (!name || !val) return; onAdd({ name, amt: mode === "yen" ? toK(Number(val), rate) : Number(val), cat, ok: true }); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ fontSize: 13, fontWeight: 800, color: T.text }}>⚡ 빠른 입력</span><button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }} onClick={onClose}>✕</button></div>
      <input ref={ref} style={inputStyle} placeholder="뭐 샀어요?" value={name} onChange={e => setName(e.target.value)} />
      <div style={{ display: "flex", gap: S.sm }}>
        <button style={pill(mode === "yen")} onClick={() => setMode("yen")}>¥ 엔</button>
        <button style={pill(mode === "krw")} onClick={() => setMode("krw")}>₩ 원</button>
        <input type="number" style={{ ...inputStyle, flex: 1 }} placeholder="금액" value={val} onChange={e => setVal(e.target.value)} onKeyDown={e => { if (e.key === "Enter") submit(); }} />
      </div>
      {val && <div style={{ fontSize: 11, color: T.textSoft, marginTop: -S.xs }}>{mode === "yen" ? `≈ ₩${fmt(toK(Number(val), rate))}` : `≈ ¥${fmt(toY(Number(val), rate))}`}</div>}
      <div style={{ display: "flex", gap: S.xs }}>{EC.map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11, padding: "4px 10px" }} onClick={() => setCat(c)}>{(CAT[c]||{}).emoji} {c}</button>)}</div>
      <button style={btnPrimary} disabled={!name || !val} onClick={submit}>추가</button>
    </div>
  );
}

function AddExpForm({ rate, onAdd }) {
  const [name, setName] = useState(""); const [amt, setAmt] = useState(""); const [yen, setYen] = useState(""); const [cat, setCat] = useState("식비"); const [ok, setOk] = useState(false); const [mode, setMode] = useState("krw");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>항목명</label><input style={inputStyle} placeholder="라멘 점심" value={name} onChange={e => setName(e.target.value)} /></div>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: S.sm, marginBottom: S.sm }}><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft }}>금액</label><button style={{ ...pill(mode === "krw"), fontSize: 10 }} onClick={() => setMode("krw")}>₩</button><button style={{ ...pill(mode === "yen"), fontSize: 10 }} onClick={() => setMode("yen")}>¥</button></div>
        {mode === "krw" ? <input type="number" style={inputStyle} placeholder="10000" value={amt} onChange={e => { setAmt(e.target.value); setYen(String(toY(Number(e.target.value), rate))); }} /> : <input type="number" style={inputStyle} placeholder="1000" value={yen} onChange={e => { setYen(e.target.value); setAmt(String(toK(Number(e.target.value), rate))); }} />}
        {amt && <div style={{ fontSize: 10, color: T.textMuted, marginTop: S.xs }}>₩{fmt(Number(amt))} ≈ ¥{fmt(toY(Number(amt), rate))}</div>}
      </div>
      <div style={{ display: "flex", gap: S.sm }}>{EC.map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11 }} onClick={() => setCat(c)}>{(CAT[c]||{}).emoji} {c}</button>)}</div>
      <label style={{ display: "flex", alignItems: "center", gap: S.sm, fontSize: 12, color: T.textSoft }}><ToggleSwitch checked={ok} onCheckedChange={setOk} />확정 비용</label>
      <button style={btnPrimary} disabled={!name || (!amt && !yen)} onClick={() => onAdd({ name, amt: Number(amt), cat, ok })}>추가하기</button>
    </div>
  );
}

function AddChkForm({ onAdd }) {
  const [text, setText] = useState(""); const [cat, setCat] = useState("준비");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>할 일</label><input style={inputStyle} placeholder="여행자보험" value={text} onChange={e => setText(e.target.value)} /></div>
      <div style={{ display: "flex", gap: S.sm }}>{CC.filter(c => c !== "전체").map(c => <button key={c} style={{ ...pill(cat === c), fontSize: 11 }} onClick={() => setCat(c)}>{c}</button>)}</div>
      <button style={btnPrimary} disabled={!text} onClick={() => onAdd({ text, cat })}>추가하기</button>
    </div>
  );
}

function AddTripForm({ onAdd }) {
  const [name, setName] = useState(""); const [emoji, setEmoji] = useState("🌏"); const [dates, setDates] = useState(""); const [trav, setTrav] = useState("2"); const [rate, setRate] = useState("9.29");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textSoft }}>새 여행</div>
      <div style={{ display: "flex", gap: S.sm }}><input style={{ ...inputStyle, width: 50, textAlign: "center" }} value={emoji} onChange={e => setEmoji(e.target.value)} /><input style={{ ...inputStyle, flex: 1 }} placeholder="여행 이름" value={name} onChange={e => setName(e.target.value)} /></div>
      <input style={inputStyle} placeholder="기간" value={dates} onChange={e => setDates(e.target.value)} />
      <div style={{ display: "flex", gap: S.sm }}>
        <div style={{ flex: 1 }}><label style={{ fontSize: 10, color: T.textMuted, display: "block", marginBottom: S.xs }}>인원</label><input type="number" style={inputStyle} value={trav} onChange={e => setTrav(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={{ fontSize: 10, color: T.textMuted, display: "block", marginBottom: S.xs }}>환율</label><input type="number" step="0.01" style={inputStyle} value={rate} onChange={e => setRate(e.target.value)} /></div>
      </div>
      <button style={btnPrimary} disabled={!name} onClick={() => onAdd({ name, emoji, dates, travelers: Number(trav), rate: Number(rate), startDate: "" })}>추가</button>
    </div>
  );
}

function SettingsForm({ trip, onSave }) {
  const [name, setName] = useState(trip.name); const [emoji, setEmoji] = useState(trip.emoji); const [dates, setDates] = useState(trip.dates); const [sd, setSd] = useState(trip.startDate || ""); const [trav, setTrav] = useState(String(trip.travelers)); const [rate, setRate] = useState(String(trip.rate));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ display: "flex", gap: S.sm }}><input style={{ ...inputStyle, width: 50, textAlign: "center" }} value={emoji} onChange={e => setEmoji(e.target.value)} /><input style={{ ...inputStyle, flex: 1 }} value={name} onChange={e => setName(e.target.value)} /></div>
      <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>기간 표시</label><input style={inputStyle} value={dates} onChange={e => setDates(e.target.value)} /></div>
      <div><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>출발일 (D-Day용)</label><input type="date" style={inputStyle} value={sd} onChange={e => setSd(e.target.value)} /></div>
      <div style={{ display: "flex", gap: S.sm }}>
        <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>인원</label><input type="number" style={inputStyle} value={trav} onChange={e => setTrav(e.target.value)} /></div>
        <div style={{ flex: 1 }}><label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>환율 ₩/¥</label><input type="number" step="0.01" style={inputStyle} value={rate} onChange={e => setRate(e.target.value)} /></div>
      </div>
      <button style={btnPrimary} onClick={() => onSave({ name, emoji, dates, startDate: sd, travelers: Number(trav), rate: Number(rate) })}>저장</button>
    </div>
  );
}
