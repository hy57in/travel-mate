import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export default function useSupabaseTrips(user) {
  const [trips, setTrips] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load trips from Supabase
  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return; }

    const load = async () => {
      const { data, error } = await supabase
        .from("trips")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data?.length) {
        const loaded = data.map(row => ({
          id: row.id,
          ...row.data,
          name: row.name,
          emoji: row.emoji,
        }));
        setTrips(loaded);
        setActiveId(loaded[0].id);
      }
      setLoading(false);
    };
    load();

    // Realtime subscription
    const channel = supabase
      .channel("trips-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          const row = payload.new;
          setTrips(prev => prev.map(t => t.id === row.id ? { id: row.id, ...row.data, name: row.name, emoji: row.emoji } : t));
        } else if (payload.eventType === "INSERT") {
          const row = payload.new;
          setTrips(prev => [...prev, { id: row.id, ...row.data, name: row.name, emoji: row.emoji }]);
        } else if (payload.eventType === "DELETE") {
          setTrips(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const saveTrip = useCallback(async (trip) => {
    if (!supabase || !user) return;
    const { id, name, emoji, ...data } = trip;
    await supabase.from("trips").upsert({
      id,
      owner_id: user.id,
      name,
      emoji,
      data,
    });
  }, [user]);

  const deleteTrip = useCallback(async (tripId) => {
    if (!supabase || !user) return;
    await supabase.from("trips").delete().eq("id", tripId);
  }, [user]);

  const persistAll = useCallback(async (nextTrips, nextActiveId) => {
    setTrips(nextTrips);
    if (nextActiveId) setActiveId(nextActiveId);
    if (!supabase || !user) return;

    // Upsert all trips
    for (const trip of nextTrips) {
      const { id, name, emoji, ...data } = trip;
      await supabase.from("trips").upsert({
        id,
        owner_id: user.id,
        name,
        emoji,
        data,
      });
    }
  }, [user]);

  // Share trip with another user by email
  const shareTrip = useCallback(async (tripId, email) => {
    if (!supabase) return { error: "Supabase not configured" };

    // Find user by email (requires admin, so we use a simple approach)
    // For now, generate a share link instead
    const shareUrl = `${window.location.origin}?join=${tripId}`;
    return { shareUrl };
  }, []);

  return {
    trips,
    activeId,
    setActiveId,
    loading,
    saveTrip,
    deleteTrip,
    persistAll,
    shareTrip,
  };
}
