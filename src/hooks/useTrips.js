import { useState, useEffect, useCallback, useMemo } from "react";
import { CAT } from "../tokens";
import { load, save } from "../storage";
import { DEFAULT_TRIPS } from "../data/defaults";

const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1;

const TIME_RE = /(\d{1,2}):(\d{2})/;
const parseTime = (t) => {
  const m = t.replace(/[~：]/g, "").trim().match(TIME_RE);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 9999;
};

export default function useTrips() {
  const [trips, setTrips] = useState(DEFAULT_TRIPS);
  const [activeId, setActiveId] = useState(DEFAULT_TRIPS[0].id);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = load();
    if (data?.trips?.length) {
      setTrips(data.trips);
      setActiveId(data.aid || data.trips[0]?.id);
    }
    setLoading(false);
  }, []);

  const persist = useCallback(
    (nextTrips, nextId) => {
      setTrips(nextTrips);
      if (nextId) setActiveId(nextId);
      save({ trips: nextTrips, aid: nextId || activeId });
    },
    [activeId],
  );

  const trip = trips?.find((t) => t.id === activeId);

  const updateTrip = useCallback(
    (updates) => {
      persist(trips.map((t) => (t.id === activeId ? { ...t, ...updates } : t)));
    },
    [trips, activeId, persist],
  );

  const reset = useCallback(() => {
    setTrips(DEFAULT_TRIPS);
    setActiveId(DEFAULT_TRIPS[0].id);
    save({ trips: DEFAULT_TRIPS, aid: DEFAULT_TRIPS[0].id });
  }, []);

  // Day operations
  const sortDayItems = useCallback(
    (dayIndex) => {
      const day = trip.days[dayIndex];
      const sorted = [...day.items].sort((a, b) => parseTime(a.time) - parseTime(b.time));
      const nextDays = [...trip.days];
      nextDays[dayIndex] = { ...day, items: sorted };
      updateTrip({ days: nextDays });
    },
    [trip, updateTrip],
  );

  const reorderItems = useCallback(
    (dayIndex, oldIdx, newIdx) => {
      const day = trip.days[dayIndex];
      const items = [...day.items];
      const [moved] = items.splice(oldIdx, 1);
      items.splice(newIdx, 0, moved);
      const nextDays = [...trip.days];
      nextDays[dayIndex] = { ...day, items };
      updateTrip({ days: nextDays });
    },
    [trip, updateTrip],
  );

  const addDay = useCallback(() => {
    const dayCount = trip.days.length;
    let date = "";
    if (trip.startDate) {
      const d = new Date(trip.startDate);
      d.setDate(d.getDate() + dayCount);
      const dow = ["\uC77C", "\uC6D4", "\uD654", "\uC218", "\uBAA9", "\uAE08", "\uD1A0"][d.getDay()];
      date = `${d.getMonth() + 1}/${d.getDate()} (${dow})`;
    }
    updateTrip({ days: [...trip.days, { date, title: `Day ${dayCount + 1}`, memo: "", items: [] }] });
    return dayCount;
  }, [trip, updateTrip]);

  const deleteDay = useCallback(
    (dayIndex) => {
      updateTrip({ days: trip.days.filter((_, i) => i !== dayIndex) });
    },
    [trip, updateTrip],
  );

  const updateDay = useCallback(
    (dayIndex, updates) => {
      const nextDays = [...trip.days];
      nextDays[dayIndex] = { ...nextDays[dayIndex], ...updates };
      updateTrip({ days: nextDays });
    },
    [trip, updateTrip],
  );

  // Derived budget values (js-combine-iterations: single pass)
  const budgetSummary = useMemo(() => {
    if (!trip) return { confirmedAmount: 0, estimatedAmount: 0, total: 0, perPerson: 0, categoryTotals: {}, donutData: [], settlement: [] };
    let confirmedAmount = 0;
    let estimatedAmount = 0;
    const categoryTotals = {};
    const paidByPerson = {};
    for (const expense of trip.expenses) {
      if (expense.ok) confirmedAmount += expense.amt;
      else estimatedAmount += expense.amt;
      categoryTotals[expense.cat] = (categoryTotals[expense.cat] || 0) + expense.amt;
      const who = expense.paidBy ?? 0;
      paidByPerson[who] = (paidByPerson[who] || 0) + expense.amt;
    }
    const total = confirmedAmount + estimatedAmount;
    const travelers = trip.travelers || 2;
    const perPerson = Math.round(total / travelers);
    const donutData = Object.entries(categoryTotals).map(([cat, value]) => ({
      color: CAT[cat]?.color || "#999",
      value,
      label: cat,
    }));
    // Settlement: who owes whom
    const names = trip.travelerNames || [];
    const settlement = names.map((name, i) => ({
      name,
      paid: paidByPerson[i] || 0,
      shouldPay: perPerson,
      diff: (paidByPerson[i] || 0) - perPerson,
    }));
    return { confirmedAmount, estimatedAmount, total, perPerson, categoryTotals, donutData, settlement };
  }, [trip]);

  // Derived checklist values
  const checklistSummary = useMemo(() => {
    if (!trip) return { done: 0, total: 0, percent: 0 };
    const done = trip.checklist.filter((c) => c.done).length;
    const total = trip.checklist.length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, percent };
  }, [trip]);

  // Today's day index
  const todayDayIndex = useMemo(() => {
    if (!trip?.startDate || !trip.days.length) return -1;
    const diff = Math.floor(
      (new Date().setHours(0, 0, 0, 0) - new Date(trip.startDate).setHours(0, 0, 0, 0)) / 86400000,
    );
    return diff >= 0 && diff < trip.days.length ? diff : -1;
  }, [trip?.startDate, trip?.days.length]);

  // D-Day
  const ddayText = useMemo(() => {
    if (!trip?.startDate) return "";
    const dday = Math.ceil((new Date(trip.startDate) - new Date()) / 86400000);
    if (dday > 0) return `D-${dday}`;
    if (dday === 0) return "D-Day!";
    return `\uC5EC\uD589 ${-dday}\uC77C\uCC28`;
  }, [trip?.startDate]);

  // Share as text
  const shareTrip = useCallback(() => {
    if (!trip) return "";
    const lines = [`${trip.emoji} ${trip.name}`, `${trip.dates} · ${trip.travelers}인`, ""];
    for (const [i, day] of trip.days.entries()) {
      lines.push(`📅 Day ${i + 1} — ${day.title} (${day.date})`);
      for (const item of day.items) {
        const prefix = item.hl ? "⭐" : item.skip ? "~~" : item.pend ? "❓" : "  ";
        lines.push(`  ${prefix} ${item.time} ${item.text}`);
      }
      lines.push("");
    }
    return lines.join("\n");
  }, [trip]);

  // CSV export
  const exportCSV = useCallback(() => {
    if (!trip) return;
    const { total, perPerson } = budgetSummary;
    const rows = [["\uCE74\uD14C\uACE0\uB9AC", "\uD56D\uBAA9", "\uC6D0", "\uC5D4", "\uD655\uC815"]];
    for (const e of trip.expenses) {
      rows.push([e.cat, e.name, e.amt, Math.round(e.amt / trip.rate), e.ok ? "Y" : "N"]);
    }
    rows.push([], ["", "\uD569\uACC4", total, Math.round(total / trip.rate)], ["", "1\uC778\uB2F9", perPerson, Math.round(perPerson / trip.rate)]);
    const blob = new Blob(["\uFEFF" + rows.map((r) => r.join(",")).join("\n")], { type: "text/csv;charset=utf-8;" });
    Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${trip.name}_\uACBD\uBE44.csv` }).click();
  }, [trip, budgetSummary]);

  return {
    trips,
    activeId,
    setActiveId,
    loading,
    trip,
    persist,
    updateTrip,
    reset,
    nextId,
    // Day operations
    sortDayItems,
    reorderItems,
    addDay,
    deleteDay,
    updateDay,
    // Derived
    budgetSummary,
    checklistSummary,
    todayDayIndex,
    ddayText,
    shareTrip,
    exportCSV,
  };
}
