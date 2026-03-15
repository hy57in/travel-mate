import { useState, useEffect, useCallback, useRef } from "react";
import { load, save } from "../storage";
import { DEFAULT_TRIPS } from "../data/defaults";
import { supabase } from "../lib/supabase";
import useBudget from "./useBudget";
import useDayOps from "./useDayOps";

const nextId = (arr) => Math.max(0, ...arr.map((x) => x.id)) + 1;

// Supabase row → app trip object
const rowToTrip = (row) => ({ id: row.id, ...row.data, name: row.name, emoji: row.emoji });
// App trip → Supabase row
const tripToRow = (trip, userId) => {
  const { id, name, emoji, ...data } = trip;
  return { id, owner_id: userId, name: name || "", emoji: emoji || "✈️", data };
};

export default function useTrips(user) {
  const [trips, setTrips] = useState(DEFAULT_TRIPS);
  const [activeId, setActiveId] = useState(DEFAULT_TRIPS[0].id);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef(null);

  // Load: Supabase if logged in, otherwise localStorage
  useEffect(() => {
    if (supabase && user) {
      supabase.from("trips").select("*").order("created_at").then(({ data, error }) => {
        if (!error && data?.length) {
          setTrips(data.map(rowToTrip));
          setActiveId(data[0].id);
        } else if (!error && !data?.length) {
          const local = load();
          if (local?.trips?.length) {
            const rows = local.trips.map(t => tripToRow(t, user.id));
            supabase.from("trips").upsert(rows).then(() => {
              setTrips(local.trips);
              setActiveId(local.aid || local.trips[0]?.id);
            });
          }
        }
        setLoading(false);
      });

      const channel = supabase
        .channel("trips-sync")
        .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, (payload) => {
          if (payload.eventType === "UPDATE") {
            const t = rowToTrip(payload.new);
            setTrips(prev => prev.map(p => p.id === t.id ? t : p));
          } else if (payload.eventType === "INSERT") {
            const t = rowToTrip(payload.new);
            setTrips(prev => prev.some(p => p.id === t.id) ? prev : [...prev, t]);
          } else if (payload.eventType === "DELETE") {
            setTrips(prev => prev.filter(p => p.id !== payload.old.id));
          }
        })
        .subscribe();
      channelRef.current = channel;

      return () => { supabase.removeChannel(channel); };
    } else {
      const data = load();
      if (data?.trips?.length) {
        setTrips(data.trips);
        setActiveId(data.aid || data.trips[0]?.id);
      }
      setLoading(false);
    }
  }, [user]);

  const persist = useCallback(
    (nextTrips, nextActiveId) => {
      setTrips(nextTrips);
      if (nextActiveId) setActiveId(nextActiveId);
      save({ trips: nextTrips, aid: nextActiveId || activeId });
      if (supabase && user) {
        for (const t of nextTrips) {
          supabase.from("trips").upsert(tripToRow(t, user.id));
        }
      }
    },
    [activeId, user],
  );

  const trip = trips?.find((t) => t.id === activeId);

  const updateTrip = useCallback(
    (updates) => {
      const updated = trips.map((t) => (t.id === activeId ? { ...t, ...updates } : t));
      setTrips(updated);
      const updatedTrip = updated.find(t => t.id === activeId);
      save({ trips: updated, aid: activeId });
      if (supabase && user && updatedTrip) {
        supabase.from("trips").upsert(tripToRow(updatedTrip, user.id));
      }
    },
    [trips, activeId, user],
  );

  const reset = useCallback(() => {
    setTrips(DEFAULT_TRIPS);
    setActiveId(DEFAULT_TRIPS[0].id);
    save({ trips: DEFAULT_TRIPS, aid: DEFAULT_TRIPS[0].id });
    if (supabase && user) {
      supabase.from("trips").delete().eq("owner_id", user.id).then(() => {
        for (const t of DEFAULT_TRIPS) {
          supabase.from("trips").upsert(tripToRow(t, user.id));
        }
      });
    }
  }, [user]);

  const { budgetSummary, exportCSV } = useBudget(trip);
  const { sortDayItems, reorderItems, addDay, deleteDay, updateDay, todayDayIndex, ddayText, shareTrip, checklistSummary } = useDayOps(trip, updateTrip);

  return {
    trips, activeId, setActiveId, loading, trip,
    persist, updateTrip, reset, nextId,
    sortDayItems, reorderItems, addDay, deleteDay, updateDay,
    budgetSummary, checklistSummary, todayDayIndex, ddayText, shareTrip, exportCSV,
  };
}
