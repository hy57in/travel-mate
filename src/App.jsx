import { useState, useEffect, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { S, T, THEME_LIGHT, THEME_DARK } from "./tokens";
import { glass, pill, btnPrimary, btnOutline } from "./styles";

import useTrips from "./hooks/useTrips";
import useTheme from "./hooks/useTheme";

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

export default function App() {
  const {
    trips, activeId, setActiveId, loading, trip,
    persist, updateTrip, reset, nextId,
    sortDayItems, reorderItems, addDay, deleteDay, updateDay,
    budgetSummary, checklistSummary, todayDayIndex, ddayText, exportCSV,
  } = useTrips();
  const { theme, setTheme } = useTheme();

  const [expandedDay, setExpandedDay] = useState(0);
  const [checklistFilter, setChecklistFilter] = useState("전체");
  const [expenseFilter, setExpenseFilter] = useState("전체");
  const [tab, setTab] = useState("itinerary");
  const [dialog, setDialog] = useState(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [editingCheckId, setEditingCheckId] = useState(null);

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

  const { confirmedAmount, estimatedAmount, total, perPerson, categoryTotals, donutData } = budgetSummary;
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
        :root[data-theme="dark"] input, :root[data-theme="dark"] textarea, :root[data-theme="dark"] select { color-scheme: dark; }
        @media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) input, :root:not([data-theme="light"]) textarea, :root:not([data-theme="light"]) select { color-scheme: dark; } }
        * { -webkit-tap-highlight-color: transparent; }
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
          <div style={{ display: "flex", gap: S.xs, flexShrink: 0 }}>
            <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: S.xs }} onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "dark" : "dark")}>{theme === "dark" ? "☀️" : "🌙"}</button>
            <button style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", padding: S.xs }} onClick={() => setDialog({ type: "settings" })}>⚙️</button>
            <button style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer", padding: S.xs, color: T.textMuted }} onClick={reset}>↺</button>
          </div>
        </div>

        <div style={{ ...glass, padding: `${S.lg}px ${S.xl}px`, display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: S.sm }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>{trip.emoji} {trip.name}</div>
            <div style={{ fontSize: 12, color: T.textSoft, marginTop: S.xs }}>{trip.dates} · {trip.travelers}인 · ¥1=₩{trip.rate}</div>
          </div>
          {ddayText ? <div style={{ background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", borderRadius: T.rSm, padding: `${S.sm}px ${S.lg}px`, fontSize: 16, fontWeight: 700, letterSpacing: -0.5 }}>{ddayText}</div> : null}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: `0 ${S.xl}px` }}>
        <div style={{ display: "flex", gap: S.xs, ...glass, padding: S.xs }}>
          {[
            { value: "itinerary", emoji: "📅", label: "일정" },
            { value: "budget", emoji: "💰", label: "경비" },
            { value: "checklist", emoji: "✅", label: `체크 ${checkDone}/${checkTotal}` },
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
        {tab === "itinerary" && (
          <ItineraryTab
            trip={trip} expandedDay={expandedDay} setExpandedDay={setExpandedDay}
            sortDayItems={sortDayItems} reorderItems={reorderItems}
            addDay={handleAddDay} deleteDay={handleDeleteDay} updateDay={updateDay}
            todayDayIndex={todayDayIndex} setDialog={setDialog}
          />
        )}
        {tab === "budget" && (
          <BudgetTab
            trip={trip} expenseFilter={expenseFilter} setExpenseFilter={setExpenseFilter}
            filteredExpenses={filteredExpenses}
            confirmedAmount={confirmedAmount} estimatedAmount={estimatedAmount}
            total={total} perPerson={perPerson}
            categoryTotals={categoryTotals} donutData={donutData}
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
        {tab === "memo" && <MemoTab trip={trip} updateTrip={updateTrip} />}
      </div>

      {/* FAB */}
      <div style={{ position: "fixed", bottom: S.xxl, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: S.md, zIndex: 50 }}>
        {fabOpen && (
          <div style={{ ...glass, width: 300, padding: S.lg, boxShadow: T.shadowLg }} className="fade-in">
            <QuickExp
              rate={trip.rate} days={trip.days}
              onAdd={(exp) => { updateTrip({ expenses: [...trip.expenses, { ...exp, id: nextId(trip.expenses) }] }); setFabOpen(false); }}
              onClose={() => setFabOpen(false)}
            />
          </div>
        )}
        <button onClick={() => setFabOpen(!fabOpen)} style={{ width: 52, height: 52, borderRadius: "50%", border: "none", background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", fontSize: 22, fontWeight: 800, cursor: "pointer", boxShadow: "0 4px 16px rgba(224,116,96,0.25)", animation: fabOpen ? "none" : "pulse 2s infinite" }}>
          {fabOpen ? "✕" : "₩"}
        </button>
      </div>

      {/* Dialogs */}
      <Dialog.Root open={!!dialog} onOpenChange={() => setDialog(null)}>
        <Dialog.Portal>
          <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 999 }} />
          <Dialog.Content style={{ maxWidth: 380, borderRadius: T.r + 4, padding: S.xxl, position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: T.cardBg, zIndex: 1000, width: "90vw" }}>
            {dialog?.type === "item" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>{dialog.isNew ? "📌 일정 추가" : "✏️ 일정 수정"}</Dialog.Title></div>
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
                  }}
                  onDelete={dialog.isNew ? null : () => setConfirmDelete({
                    msg: "삭제할까요?",
                    onOk: () => {
                      const nextDays = [...trip.days];
                      nextDays[dialog.dayIdx] = { ...nextDays[dialog.dayIdx], items: nextDays[dialog.dayIdx].items.filter((_, i) => i !== dialog.itemIdx) };
                      updateTrip({ days: nextDays });
                      setDialog(null);
                    },
                  })}
                />
              </>
            )}
            {dialog?.type === "addExp" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>💰 경비 추가</Dialog.Title></div>
                <AddExpForm rate={trip.rate} days={trip.days} onAdd={(exp) => { updateTrip({ expenses: [...trip.expenses, { ...exp, id: nextId(trip.expenses) }] }); setDialog(null); }} />
              </>
            )}
            {dialog?.type === "addChk" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>✅ 체크리스트 추가</Dialog.Title></div>
                <AddChkForm onAdd={(item) => { updateTrip({ checklist: [...trip.checklist, { ...item, id: nextId(trip.checklist), done: false }] }); setDialog(null); }} />
              </>
            )}
            {dialog?.type === "settings" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>⚙️ 여행 설정</Dialog.Title></div>
                <SettingsForm trip={trip} theme={theme} setTheme={setTheme} onSave={(upd) => { updateTrip(upd); setDialog(null); }} />
              </>
            )}
            {dialog?.type === "trip" && (
              <>
                <div><Dialog.Title style={{ fontSize: 16, fontWeight: 700 }}>🌏 여행 관리</Dialog.Title></div>
                <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
                  {trips.map((t) => (
                    <div key={t.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 600 }}>
                      <span>{t.emoji} {t.name}</span>
                      {trips.length > 1 && (
                        <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }} onClick={() => { const remaining = trips.filter((x) => x.id !== t.id); persist(remaining, t.id === activeId ? remaining[0].id : activeId); }}>🗑</button>
                      )}
                    </div>
                  ))}
                  <div style={{ height: 1, background: T.divider }} />
                  <AddTripForm onAdd={(t) => { const newTrip = { ...t, id: `trip-${Date.now()}`, days: [], expenses: [], checklist: [], memo: "", rate: t.rate || 9.29 }; persist([...trips, newTrip], newTrip.id); setDialog(null); }} />
                </div>
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
