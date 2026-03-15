import { useState, useEffect, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { S, T, CAT, fmt, toY, THEME_LIGHT, THEME_DARK } from "./tokens";
import { glass, pill, btnPrimary, btnOutline } from "./styles";
import { load, save } from "./storage";

import ItineraryTab from "./components/ItineraryTab";
import BudgetTab from "./components/BudgetTab";
import ChecklistTab from "./components/ChecklistTab";
import MemoTab from "./components/MemoTab";
import QuickExp from "./components/forms/QuickExp";
import ItemForm from "./components/forms/ItemForm";
import AddExpForm from "./components/forms/AddExpForm";
import AddChkForm from "./components/forms/AddChkForm";
import AddTripForm from "./components/forms/AddTripForm";
import SettingsForm from "./components/forms/SettingsForm";

/* === DEFAULT DATA === */
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

/* === MAIN APP === */
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
  const [theme, setTheme] = useState(() => localStorage.getItem("tp-theme") || "auto");

  useEffect(() => {
    const data = load();
    if (data?.trips?.length) { setTrips(data.trips); setAid(data.aid || data.trips[0]?.id); }
    setLoading(false);
  }, []);

  // 테마 적용
  const isDark = theme === "dark" || (theme === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    localStorage.setItem("tp-theme", theme);
    if (theme === "auto") document.documentElement.removeAttribute("data-theme");
    else document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);
  useEffect(() => {
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setTheme(t => t === "auto" ? "auto" : t); // force re-render
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const persist = useCallback((nt, na) => { setTrips(nt); if (na) setAid(na); save({ trips: nt, aid: na || aid }); }, [aid]);
  const trip = trips?.find(t => t.id === aid);
  const ut = useCallback(u => { persist(trips.map(t => t.id === aid ? { ...t, ...u } : t)); }, [trips, aid, persist]);

  // 여행 시작일 기준 오늘의 Day 인덱스 계산
  const todayDayIdx = (() => {
    if (!trip?.startDate || !trip.days.length) return -1;
    const diff = Math.floor((new Date().setHours(0,0,0,0) - new Date(trip.startDate).setHours(0,0,0,0)) / 86400000);
    return diff >= 0 && diff < trip.days.length ? diff : -1;
  })();

  // 여행 전환 또는 최초 로드 시 오늘 Day 자동 펼치기
  useEffect(() => {
    if (todayDayIdx >= 0) setExDay(todayDayIdx);
  }, [aid, todayDayIdx]);
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

  const reorderItems = (di, oldIdx, newIdx) => {
    const day = trip.days[di];
    const items = [...day.items];
    const [moved] = items.splice(oldIdx, 1);
    items.splice(newIdx, 0, moved);
    const nd = [...trip.days]; nd[di] = { ...day, items }; ut({ days: nd });
  };

  const addDay = () => {
    const dayCount = trip.days.length;
    let date = "";
    if (trip.startDate) {
      const d = new Date(trip.startDate);
      d.setDate(d.getDate() + dayCount);
      const dow = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
      date = `${d.getMonth() + 1}/${d.getDate()} (${dow})`;
    }
    ut({ days: [...trip.days, { date, title: `Day ${dayCount + 1}`, memo: "", items: [] }] });
    setExDay(dayCount);
  };

  const deleteDay = (di) => {
    setConfirmDel({ msg: `Day ${di + 1}을 삭제할까요?`, onOk: () => {
      ut({ days: trip.days.filter((_, i) => i !== di) });
      setExDay(-1);
    }});
  };

  const updateDay = (di, upd) => {
    const nd = [...trip.days];
    nd[di] = { ...nd[di], ...upd };
    ut({ days: nd });
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
        :root { ${THEME_LIGHT} }
        :root[data-theme="dark"] { ${THEME_DARK} }
        @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${THEME_DARK} } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 4px 16px rgba(224,116,96,0.25); } 50% { transform: scale(1.04); box-shadow: 0 6px 24px rgba(224,116,96,0.4); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.25s ease-out; }
        input:focus, textarea:focus { border-color: ${T.coral} !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      {/* -- HEADER -- */}
      <div style={{ padding: `${S.xxl}px ${S.xl}px ${S.lg}px` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
          <div style={{ display: "flex", alignItems: "center", gap: S.sm, overflow: "hidden" }}>
            {trips.map(t => <button key={t.id} style={pill(t.id === aid)} onClick={() => { setAid(t.id); setExDay(0); }}>{t.emoji} {t.name}</button>)}
            <button style={{ ...pill(false), border: `1.5px dashed ${T.textMuted}`, padding: "5px 10px" }} onClick={() => setDlg({ type: "trip" })}>＋</button>
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

      {/* -- TABS -- */}
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
              background: tab === t.v ? T.cardBg : "transparent", color: tab === t.v ? T.text : T.textMuted,
              boxShadow: tab === t.v ? T.shadow : "none",
            }}>{t.emoji} {t.l}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: `${S.lg}px ${S.xl}px 0` }}>
        {tab === "itinerary" && (
          <ItineraryTab trip={trip} exDay={exDay} setExDay={setExDay} sortDay={sortDay} reorderItems={reorderItems} addDay={addDay} deleteDay={deleteDay} updateDay={updateDay} todayDayIdx={todayDayIdx} setDlg={setDlg} />
        )}
        {tab === "budget" && (
          <BudgetTab
            trip={trip} exF={exF} setExF={setExF} fExp={fExp}
            okAmt={okAmt} estAmt={estAmt} tot={tot} pp={pp}
            catT={catT} donutData={donutData}
            editExp={editExp} setEditExp={setEditExp}
            setDlg={setDlg} setConfirmDel={setConfirmDel} ut={ut} exportCSV={exportCSV}
          />
        )}
        {tab === "checklist" && (
          <ChecklistTab
            trip={trip} ckF={ckF} setCkF={setCkF} fChk={fChk}
            ckDone={ckDone} ckTot={ckTot} ckPct={ckPct}
            editChk={editChk} setEditChk={setEditChk}
            setDlg={setDlg} setConfirmDel={setConfirmDel} ut={ut}
          />
        )}
        {tab === "memo" && <MemoTab trip={trip} ut={ut} />}
      </div>

      {/* -- FAB -- */}
      <div style={{ position: "fixed", bottom: S.xxl, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: S.md, zIndex: 50 }}>
        {fab && (
          <div style={{ ...glass, width: 300, padding: S.lg, boxShadow: T.shadowLg }} className="fade-in">
            <QuickExp rate={trip.rate} days={trip.days} onAdd={exp => { ut({ expenses: [...trip.expenses, { ...exp, id: nid(trip.expenses) }] }); setFab(false); }} onClose={() => setFab(false)} />
          </div>
        )}
        <button onClick={() => setFab(!fab)} style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", fontSize: 22, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(224,116,96,0.25)", animation: fab ? "none" : "pulse 2s infinite" }}>{fab ? "✕" : "₩"}</button>
      </div>

      {/* -- DIALOGS -- */}
      <Dialog.Root open={!!dlg} onOpenChange={() => setDlg(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:999}} />
          <Dialog.Content style={{ maxWidth: 380, borderRadius: T.r + 4, padding: S.xxl, position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.cardBg,zIndex:1000,width:"90vw" }}>
          {dlg?.type === "item" && <>
            <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>{dlg.isNew ? "📌 일정 추가" : "✏️ 일정 수정"}</Dialog.Title></div>
            <ItemForm item={dlg.isNew ? null : trip.days[dlg.dayIdx]?.items[dlg.itemIdx]}
              onSave={item => { const nd = [...trip.days]; if (dlg.isNew) nd[dlg.dayIdx] = { ...nd[dlg.dayIdx], items: [...nd[dlg.dayIdx].items, item] }; else { const ni = [...nd[dlg.dayIdx].items]; ni[dlg.itemIdx] = item; nd[dlg.dayIdx] = { ...nd[dlg.dayIdx], items: ni }; } ut({ days: nd }); setDlg(null); }}
              onDelete={dlg.isNew ? null : () => setConfirmDel({ msg: "삭제할까요?", onOk: () => { const nd = [...trip.days]; nd[dlg.dayIdx] = { ...nd[dlg.dayIdx], items: nd[dlg.dayIdx].items.filter((_, i) => i !== dlg.itemIdx) }; ut({ days: nd }); setDlg(null); } })} />
          </>}
          {dlg?.type === "addExp" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>💰 경비 추가</Dialog.Title></div><AddExpForm rate={trip.rate} days={trip.days} onAdd={exp => { ut({ expenses: [...trip.expenses, { ...exp, id: nid(trip.expenses) }] }); setDlg(null); }} /></>}
          {dlg?.type === "addChk" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>✅ 체크리스트 추가</Dialog.Title></div><AddChkForm onAdd={item => { ut({ checklist: [...trip.checklist, { ...item, id: nid(trip.checklist), done: false }] }); setDlg(null); }} /></>}
          {dlg?.type === "settings" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>⚙️ 여행 설정</Dialog.Title></div><SettingsForm trip={trip} theme={theme} setTheme={setTheme} onSave={upd => { ut(upd); setDlg(null); }} /></>}
          {dlg?.type === "trip" && <><div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>🌏 여행 관리</Dialog.Title></div>
            <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
              {trips.map(t => <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 600 }}><span>{t.emoji} {t.name}</span>{trips.length > 1 && <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }} onClick={() => { const nt = trips.filter(x => x.id !== t.id); persist(nt, t.id === aid ? nt[0].id : aid); }}>🗑</button>}</div>)}
              <div style={{ height: 1, background: T.divider }} />
              <AddTripForm onAdd={t => { const nt = { ...t, id: `trip-${Date.now()}`, days: [], expenses: [], checklist: [], memo: "", rate: t.rate || 9.29 }; persist([...trips, nt], nt.id); setDlg(null); }} />
            </div></>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!confirmDel} onOpenChange={() => setConfirmDel(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:999}} />
          <Dialog.Content style={{ maxWidth: 300, borderRadius: T.r + 4, padding: S.xxl, textAlign: "center", position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.cardBg,zIndex:1000,width:"90vw" }}>
            <p style={{ fontSize: 14, color: T.text, margin: `${S.md}px 0 ${S.xl}px` }}>{confirmDel?.msg}</p>
            <div style={{ display: "flex", gap: S.sm }}>
              <button style={{ ...btnOutline, flex: 1 }} onClick={() => setConfirmDel(null)}>취소</button>
              <button style={{ ...btnPrimary, flex: 1, background: T.danger }} onClick={() => { confirmDel?.onOk(); setConfirmDel(null); }}>삭제</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
