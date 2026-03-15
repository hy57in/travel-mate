import { useCallback, useMemo } from "react";

const TIME_RE = /(\d{1,2}):(\d{2})/;
const parseTime = (t) => {
  const m = t.replace(/[~：]/g, "").trim().match(TIME_RE);
  return m ? parseInt(m[1]) * 60 + parseInt(m[2]) : 9999;
};

export default function useDayOps(trip, updateTrip) {
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

  // Checklist summary
  const checklistSummary = useMemo(() => {
    if (!trip) return { done: 0, total: 0, percent: 0 };
    const done = trip.checklist.filter((c) => c.done).length;
    const total = trip.checklist.length;
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, percent };
  }, [trip]);

  return {
    sortDayItems, reorderItems, addDay, deleteDay, updateDay,
    todayDayIndex, ddayText, shareTrip, checklistSummary,
  };
}
