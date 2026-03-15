import { useState, useEffect, useMemo, useRef } from "react";
import { S, T } from "./tokens";
import { glass } from "./styles";

import useTrips from "./hooks/useTrips";
import useTheme from "./hooks/useTheme";
import useWeather from "./hooks/useWeather";
import useAuth from "./hooks/useAuth";
import useInvite from "./hooks/useInvite";

import GlobalStyles from "./components/GlobalStyles";
import AppHeader from "./components/AppHeader";
import AppDialogs from "./components/AppDialogs";
import ItineraryTab from "./components/ItineraryTab";
import BudgetTab from "./components/BudgetTab";
import ChecklistTab from "./components/ChecklistTab";
import MemoTab from "./components/MemoTab";
import MapTab from "./components/MapTab";
import QuickExp from "./components/forms/QuickExp";
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
    <div ref={containerRef} style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", height: "100vh", overflowY: "auto", background: `linear-gradient(180deg, ${T.peach} 0%, ${T.cream} 30%, ${T.sand} 100%)`, fontFamily: "'Outfit', 'Pretendard', -apple-system, sans-serif", paddingBottom: 100, position: "relative" }}>
      <GlobalStyles />

      <AppHeader
        trips={trips} activeId={activeId} setActiveId={setActiveId}
        trip={trip} user={user} theme={theme} setTheme={setTheme}
        scrolled={scrolled} ddayText={ddayText} todayDayIndex={todayDayIndex}
        setExpandedDay={setExpandedDay} setDialog={setDialog}
        shareTrip={shareTrip} showToast={showToast}
      />

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

      <Toast message={toast} />

      {/* FAB — budget tab only */}
      {tab === "budget" && <div style={{ position: "fixed", bottom: S.xxl, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: S.md, zIndex: 50 }}>
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

      <AppDialogs
        dialog={dialog} setDialog={setDialog}
        confirmDelete={confirmDelete} setConfirmDelete={setConfirmDelete}
        trip={trip} trips={trips} user={user}
        theme={theme} setTheme={setTheme}
        updateTrip={updateTrip} persist={persist} reset={reset} nextId={nextId}
        showToast={showToast}
        signInWithEmail={signInWithEmail} signInWithGoogle={signInWithGoogle} signOut={signOut}
        createInvite={createInvite}
      />
    </div>
  );
}
