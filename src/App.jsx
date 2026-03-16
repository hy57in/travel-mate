import { useState, useEffect, useMemo, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { S, T, THEME_LIGHT, THEME_DARK } from "./tokens";
import { glass, pill, btnPrimary, btnOutline } from "./styles";

import useTrips from "./hooks/useTrips";
import useTheme from "./hooks/useTheme";
import useWeather from "./hooks/useWeather";
import useAuth from "./hooks/useAuth";
import useInvite from "./hooks/useInvite";

import ItineraryTab from "./components/ItineraryTab";
import BudgetTab from "./components/BudgetTab";
import ChecklistTab from "./components/ChecklistTab";
import MemoTab from "./components/MemoTab";
import MapTab from "./components/MapTab";
import QuickExp from "./components/forms/QuickExp";
import ItemForm from "./components/forms/ItemForm";
import AddExpForm from "./components/forms/AddExpForm";
import AddChkForm from "./components/forms/AddChkForm";
import AddTripForm from "./components/forms/AddTripForm";
import SettingsForm from "./components/forms/SettingsForm";
import AITripForm from "./components/forms/AITripForm";
import LoginForm from "./components/forms/LoginForm";
import Toast, { useToast } from "./components/ui/Toast";
import TripRecap from "./components/ui/TripRecap";

export default function App() {
  const { user, loading: authLoading, signInWithEmail, signInWithGoogle, signOut, isOnline } = useAuth();
  const { createInvite } = useInvite(user);
  const {
    trips, activeId, setActiveId, loading, trip,
    persist, updateTrip, reset, nextId,
    sortDayItems, reorderItems, addDay, deleteDay, updateDay,
    budgetSummary, checklistSummary, todayDayIndex, ddayText, shareTrip, exportCSV,
  } = useTrips(user);
  const { theme, setTheme } = useTheme();
  const weather = useWeather(trip?.startDate, trip?.days);
  const { toast, show: showToast } = useToast();

  const [expandedDay, setExpandedDay] = useState(0);
  const [checklistFilter, setChecklistFilter] = useState("전체");
  const [expenseFilter, setExpenseFilter] = useState("전체");
  const [tab, setTab] = useState("itinerary");
  const [dialog, setDialog] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingCheckId, setEditingCheckId] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrolled(el.scrollTop > 80);
    el.addEventListener("scroll", handler, { passive: true });
    return () => el.removeEventListener("scroll", handler);
  }, []);

  // 여행 전환 또는 최초 로드 시 오늘 Day 자동 펼치기
  useEffect(() => {
    if (todayDayIndex >= 0) setExpandedDay(todayDayIndex);
  }, [activeId, todayDayIndex]);

  const filteredExpenses = useMemo(
    () => (expenseFilter === "전체" ? trip?.expenses : trip?.expenses.filter((e) => e.cat === expenseFilter)) ?? [],
    [trip?.expenses, expenseFilter],
  );
  const filteredChecklist = useMemo(
    () => (checklistFilter === "전체" ? trip?.checklist : trip?.checklist.filter((c) => c.cat === checklistFilter)) ?? [],
    [trip?.checklist, checklistFilter],
  );

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <div style={{ width: 28, height: 28, border: `3px solid ${T.coralLight}`, borderTop: `3px solid ${T.coral}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }
  if (!trip) return null;

  const { confirmedAmount, estimatedAmount, total, perPerson, categoryTotals, donutData, settlement } = budgetSummary;
  const { done: checkDone, total: checkTotal, percent: checkPercent } = checklistSummary;

  const handleDeleteDay = (dayIndex) => {
    setConfirmDelete({
      msg: `Day ${dayIndex + 1}을 삭제할까요?`,
      onOk: () => { deleteDay(dayIndex); setExpandedDay(-1); },
    });
  };

  const handleAddDay = () => {
    const newIndex = addDay();
    setExpandedDay(newIndex);
  };

  return (
    <div ref={containerRef} style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", height: "100vh", overflowY: "auto", background: `linear-gradient(180deg, ${T.peach} 0%, ${T.cream} 30%, ${T.sand} 100%)`, fontFamily: "'Outfit', 'Pretendard', -apple-system, sans-serif", paddingTop: "env(safe-area-inset-top)", paddingBottom: "calc(100px + env(safe-area-inset-bottom))", position: "relative" }}>
      <style>{`
        :root { ${THEME_LIGHT} }
        :root[data-theme="dark"] { ${THEME_DARK} }
        @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { ${THEME_DARK} } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { transform: scale(1); box-shadow: 0 4px 16px rgba(224,116,96,0.25); } 50% { transform: scale(1.04); box-shadow: 0 6px 24px rgba(224,116,96,0.4); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes dialogIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.95); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }
        @keyframes checkPop { 0% { transform: scale(1); } 50% { transform: scale(1.3); } 100% { transform: scale(1); } }
        .fade-in { animation: fadeIn 0.25s ease-out; }
        .slide-in { animation: slideIn 0.2s ease-out; }
        .scale-in { animation: scaleIn 0.2s ease-out; }
        .check-pop { animation: checkPop 0.25s ease-out; }
        input:focus, textarea:focus { border-color: ${T.coral} !important; outline: none; box-shadow: 0 0 0 3px ${T.coralLight}; }
        :root[data-theme="dark"] input, :root[data-theme="dark"] textarea, :root[data-theme="dark"] select { color-scheme: dark; }
        @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) input, :root:not([data-theme="light"]) textarea, :root:not([data-theme="light"]) select { color-scheme: dark; } }
        button:disabled { opacity: 0.4; cursor: not-allowed; }
        button:active:not(:disabled) { transform: scale(0.97); }
        .day-header:active { background: ${T.glassBorder} !important; }
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; }
        html { scroll-behavior: smooth; overscroll-behavior: contain; }
      `}</style>

      {/* Header */}
      <div style={{ padding: `${S.xxl}px ${S.xl}px ${S.lg}px` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: S.sm }}>
          <div style={{ display: "flex", alignItems: "center", gap: S.sm, overflow: "hidden" }}>
            {trips.map((t) => (
              <button key={t.id} style={pill(t.id === activeId)} onClick={() => { setActiveId(t.id); setExpandedDay(0); }}>
                {t.emoji} {t.name}
              </button>
            ))}
            <button style={{ ...pill(false), border: `1.5px dashed ${T.textMuted}`, padding: "5px 10px" }} onClick={() => setDialog({ type: "trip" })}>＋</button>
          </div>
          <div style={{ display: "flex", gap: S.xs, flexShrink: 0, alignItems: "center" }}>
            {user && <button style={{ width: 24, height: 24, borderRadius: "50%", background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer" }} title={user.email} onClick={() => setDialog({ type: "settings" })}>{user.email?.[0]?.toUpperCase()}</button>}
            <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: S.xs }} onClick={() => { navigator.clipboard.writeText(shareTrip()); showToast("일정이 복사되었습니다"); }}>📋</button>
            <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: S.xs }} onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "dark" : "dark")}>{theme === "dark" ? "☀️" : "🌙"}</button>
            <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: S.xs }} onClick={() => setDialog({ type: "settings" })}>⚙️</button>
          </div>
        </div>

        <div style={{ ...glass, padding: scrolled ? `${S.sm}px ${S.lg}px` : `${S.lg}px ${S.xl}px`, marginTop: S.sm, transition: "all 0.25s ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: scrolled ? 14 : 20, fontWeight: 700, color: T.text, transition: "font-size 0.25s ease" }}>{trip.emoji} {trip.name}</div>
              {!scrolled && <div style={{ fontSize: 12, color: T.textSoft, marginTop: S.xs }}>{trip.dates} · {trip.travelers}인 · ¥1=₩{trip.rate}</div>}
            </div>
            {ddayText ? <div style={{ background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", borderRadius: T.rSm, padding: scrolled ? `${S.xs}px ${S.md}px` : `${S.sm}px ${S.lg}px`, fontSize: scrolled ? 12 : 16, fontWeight: 700, letterSpacing: -0.5, transition: "all 0.25s ease" }}>{ddayText}</div> : null}
          </div>
          {!scrolled && todayDayIndex >= 0 && trip.days[todayDayIndex]?.items.length > 0 && (() => {
            const now = new Date();
            const nowMin = now.getHours() * 60 + now.getMinutes();
            const nextItem = trip.days[todayDayIndex].items.find(it => {
              const m = it.time.match(/(\d{1,2}):(\d{2})/);
              return m && parseInt(m[1]) * 60 + parseInt(m[2]) >= nowMin;
            });
            return nextItem ? (
              <div style={{ marginTop: S.sm, padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, background: T.mintLight, display: "flex", alignItems: "center", gap: S.sm }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.mint }}>다음</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{nextItem.time} {nextItem.text}</span>
              </div>
            ) : null;
          })()}
        </div>

      </div>

      {/* Tabs */}
      <div style={{ position: "sticky", top: 0, zIndex: 20, padding: `${S.sm}px ${S.xl}px`, background: `linear-gradient(180deg, ${T.cream}, ${T.cream}ee)`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", gap: S.xs, ...glass, padding: S.xs }}>
          {[
            { value: "itinerary", emoji: "📅", label: "일정" },
            { value: "budget", emoji: "💰", label: "경비" },
            { value: "checklist", emoji: "✅", label: `체크 ${checkDone}/${checkTotal}` },
            { value: "map", emoji: "🗺️", label: "지도" },
            { value: "memo", emoji: "📝", label: "메모" },
          ].map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)} style={{
              flex: 1, padding: "10px 0", borderRadius: T.rSm, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.2s",
              background: tab === t.value ? T.cardBg : "transparent", color: tab === t.value ? T.text : T.textMuted,
              boxShadow: tab === t.value ? T.shadow : "none",
            }}>{t.emoji} {t.label}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: `${S.lg}px ${S.xl}px 0` }}>
        {isOnline && !user && (
          <button onClick={() => setDialog({ type: "login" })} style={{ ...glass, width: "100%", marginBottom: S.lg, padding: `${S.md}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.sm, border: `1.5px solid ${T.mint}33`, cursor: "pointer", borderRadius: T.rSm }}>
            <span style={{ fontSize: 16 }}>🔐</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: T.text, flex: 1, textAlign: "left" }}>로그인하면 클라우드 저장 + 실시간 공유</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: T.mint }}>로그인</span>
          </button>
        )}
        {tab === "itinerary" && (
          <ItineraryTab
            trip={trip} expandedDay={expandedDay} setExpandedDay={setExpandedDay}
            sortDayItems={sortDayItems} reorderItems={reorderItems}
            addDay={handleAddDay} deleteDay={handleDeleteDay} updateDay={updateDay}
            todayDayIndex={todayDayIndex} weather={weather} setDialog={setDialog}
          />
        )}
        {tab === "budget" && (
          <BudgetTab
            trip={trip} expenseFilter={expenseFilter} setExpenseFilter={setExpenseFilter}
            filteredExpenses={filteredExpenses}
            confirmedAmount={confirmedAmount} estimatedAmount={estimatedAmount}
            total={total} perPerson={perPerson}
            categoryTotals={categoryTotals} donutData={donutData} settlement={settlement}
            editingExpenseId={editingExpenseId} setEditingExpenseId={setEditingExpenseId}
            setDialog={setDialog} setConfirmDelete={setConfirmDelete}
            updateTrip={updateTrip} exportCSV={exportCSV}
          />
        )}
        {tab === "checklist" && (
          <ChecklistTab
            trip={trip} checklistFilter={checklistFilter} setChecklistFilter={setChecklistFilter}
            filteredChecklist={filteredChecklist}
            checkDone={checkDone} checkTotal={checkTotal} checkPercent={checkPercent}
            editingCheckId={editingCheckId} setEditingCheckId={setEditingCheckId}
            setDialog={setDialog} setConfirmDelete={setConfirmDelete} updateTrip={updateTrip}
          />
        )}
        {tab === "map" && <MapTab trip={trip} updateTrip={updateTrip} />}
        {tab === "memo" && (
          <>
            <MemoTab trip={trip} updateTrip={updateTrip} />
            <div style={{ marginTop: S.lg }}><TripRecap trip={trip} budgetSummary={budgetSummary} checklistSummary={checklistSummary} /></div>
          </>
        )}
      </div>

      {/* Toast */}
      <Toast message={toast} />

      {/* FAB — budget tab only */}
      {tab === "budget" && <div style={{ position: "fixed", bottom: `calc(${S.xxl}px + env(safe-area-inset-bottom))`, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: S.md, zIndex: 50 }}>
        {fabOpen && (
          <div style={{ ...glass, width: 300, padding: S.lg, boxShadow: T.shadowLg }} className="fade-in">
            <QuickExp
              rate={trip.rate} days={trip.days} travelerNames={trip.travelerNames}
              onAdd={(exp) => { updateTrip({ expenses: [...trip.expenses, { ...exp, id: nextId(trip.expenses) }] }); setFabOpen(false); showToast("경비가 추가되었습니다"); }}
              onClose={() => setFabOpen(false)}
            />
          </div>
        )}
        <button onClick={() => setFabOpen(!fabOpen)} style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", fontSize: 22, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(224,116,96,0.25)", animation: fabOpen ? "none" : "pulse 2s infinite" }}>
          {fabOpen ? "✕" : "₩"}
        </button>
      </div>}

      {/* Dialogs */}
      <Dialog.Root open={!!dialog} onOpenChange={() => setDialog(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999 }} />
          <Dialog.Content style={{ maxWidth: 380, borderRadius: T.r + 4, padding: S.xxl, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: T.cardBg, zIndex: 1000, width: "90vw", animation: "dialogIn 0.2s ease-out" }}>
            <Dialog.Close asChild><button style={{ position: "absolute", top: S.md, right: S.md, background: "none", border: "none", fontSize: 18, cursor: "pointer", color: T.textMuted, padding: S.xs, lineHeight: 1 }}>✕</button></Dialog.Close>
            {dialog?.type === "item" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{dialog.isNew ? "📌 일정 추가" : "✏️ 일정 수정"}</Dialog.Title></div>
                <ItemForm
                  item={dialog.isNew ? null : trip.days[dialog.dayIdx]?.items[dialog.itemIdx]}
                  onSave={(item) => {
                    const nextDays = [...trip.days];
                    if (dialog.isNew) {
                      nextDays[dialog.dayIdx] = { ...nextDays[dialog.dayIdx], items: [...nextDays[dialog.dayIdx].items, item] };
                    } else {
                      const nextItems = [...nextDays[dialog.dayIdx].items];
                      nextItems[dialog.itemIdx] = item;
                      nextDays[dialog.dayIdx] = { ...nextDays[dialog.dayIdx], items: nextItems };
                    }
                    updateTrip({ days: nextDays });
                    setDialog(null);
                    showToast(dialog.isNew ? "일정이 추가되었습니다" : "일정이 수정되었습니다");
                  }}
                  onDelete={dialog.isNew ? null : () => setConfirmDelete({
                    msg: "삭제할까요?",
                    onOk: () => {
                      const nextDays = [...trip.days];
                      nextDays[dialog.dayIdx] = { ...nextDays[dialog.dayIdx], items: nextDays[dialog.dayIdx].items.filter((_, i) => i !== dialog.itemIdx) };
                      updateTrip({ days: nextDays });
                      setDialog(null);
                      showToast("삭제되었습니다");
                    },
                  })}
                />
              </>
            )}
            {dialog?.type === "addExp" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>💰 경비 추가</Dialog.Title></div>
                <AddExpForm rate={trip.rate} days={trip.days} travelerNames={trip.travelerNames} onAdd={(exp) => { updateTrip({ expenses: [...trip.expenses, { ...exp, id: nextId(trip.expenses) }] }); setDialog(null); showToast("경비가 추가되었습니다"); }} />
              </>
            )}
            {dialog?.type === "addChk" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>✅ 체크리스트 추가</Dialog.Title></div>
                <AddChkForm onAdd={(item) => { updateTrip({ checklist: [...trip.checklist, { ...item, id: nextId(trip.checklist), done: false }] }); setDialog(null); showToast("체크리스트에 추가되었습니다"); }} />
              </>
            )}
            {dialog?.type === "settings" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>⚙️ 여행 설정</Dialog.Title></div>
                <SettingsForm trip={trip} theme={theme} setTheme={setTheme} user={user} onSave={(upd) => { updateTrip(upd); setDialog(null); showToast("설정이 저장되었습니다"); }} onReset={() => setConfirmDelete({ msg: "모든 데이터가 삭제되고 초기 상태로 돌아갑니다. 정말 초기화하시겠습니까?", onOk: () => { reset(); setDialog(null); showToast("초기화되었습니다"); } })} onSignOut={user ? () => { signOut(); setDialog(null); showToast("로그아웃되었습니다"); } : null} />
              </>
            )}
            {dialog?.type === "trip" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>🌏 여행 관리</Dialog.Title></div>
                <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                  {trips.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 600 }}>
                      <span>{t.emoji} {t.name}</span>
                      <div style={{ display: "flex", gap: S.xs }}>
                        {user && (
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13 }} onClick={async () => {
                            const url = await createInvite(t.id);
                            if (url) { navigator.clipboard.writeText(url); showToast("초대 링크가 복사되었습니다"); }
                            else showToast("초대 링크 생성 실패");
                          }}>🔗</button>
                        )}
                        {trips.length > 1 && (
                          <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }} onClick={() => { const remaining = trips.filter((x) => x.id !== t.id); persist(remaining, t.id === activeId ? remaining[0].id : activeId); }}>🗑</button>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{ height: 1, background: T.divider }} />
                  <AddTripForm onAdd={(t) => { const newTrip = { ...t, id: `trip-${Date.now()}`, days: [], expenses: [], checklist: [], memo: "", rate: t.rate || 9.29 }; persist([...trips, newTrip], newTrip.id); setDialog(null); }} />
                  <div style={{ height: 1, background: T.divider }} />
                  <button style={{ ...pill(false), border: `1.5px dashed ${T.violet}`, color: T.violet, width: "100%", textAlign: "center", padding: `${S.sm}px 0` }} onClick={() => setDialog({ type: "ai" })}>✨ AI 일정 생성</button>
                </div>
              </>
            )}
            {dialog?.type === "ai" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>✨ AI 일정 생성</Dialog.Title></div>
                <AITripForm onGenerate={(result) => {
                  const newTrip = { id: `trip-${Date.now()}`, name: result.days[0]?.title?.split(" ")[0] || "AI 여행", emoji: "✨", dates: "", startDate: "", travelers: 2, travelerNames: [], rate: 9.29, days: result.days, expenses: [], checklist: [], memo: "" };
                  persist([...trips, newTrip], newTrip.id);
                  setDialog(null);
                  showToast("AI 일정이 생성되었습니다");
                }} />
              </>
            )}
            {dialog?.type === "login" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700, color: T.text }}>🔐 로그인</Dialog.Title></div>
                <LoginForm
                  onLogin={async (email) => {
                    const { error } = await signInWithEmail(email);
                    if (error) { showToast(error); return; }
                    showToast("이메일을 확인해 주세요!");
                    setDialog(null);
                  }}
                  onGoogle={() => { signInWithGoogle(); setDialog(null); }}
                />
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999 }} />
          <Dialog.Content style={{ maxWidth: 300, borderRadius: T.r + 4, padding: S.xxl, textAlign: "center", position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: T.cardBg, zIndex: 1000, width: "90vw" }}>
            <p style={{ fontSize: 14, color: T.text, margin: `${S.md}px 0 ${S.xl}px` }}>{confirmDelete?.msg}</p>
            <div style={{ display: "flex", gap: S.sm }}>
              <button style={{ ...btnOutline, flex: 1 }} onClick={() => setConfirmDelete(null)}>취소</button>
              <button style={{ ...btnPrimary, flex: 1, background: T.danger }} onClick={() => { confirmDelete?.onOk(); setConfirmDelete(null); }}>삭제</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
