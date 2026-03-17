import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Trip } from "../types";
import type { User } from "@supabase/supabase-js";

interface SupabaseRow {
  id: string;
  name: string;
  emoji: string;
  data: Record<string, unknown>;
  created_at?: string;
}

export default function useSupabaseTrips(user: User | null) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !user) { setLoading(false); return; }

    const loadTrips = async () => {
      const { data, error } = await supabase!
        .from("trips")
        .select("*")
        .order("created_at", { ascending: true });

      if (!error && data?.length) {
        const loaded = data.map((row: SupabaseRow) => ({
          id: row.id,
          ...row.data,
          name: row.name,
          emoji: row.emoji,
        } as Trip));
        setTrips(loaded);
        setActiveId(loaded[0].id);
      }
      setLoading(false);
    };
    loadTrips();

    const channel = supabase!
      .channel("trips-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "trips" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          const row = payload.new as unknown as SupabaseRow;
          setTrips(prev => prev.map(t => t.id === row.id ? { id: row.id, ...row.data, name: row.name, emoji: row.emoji } as Trip : t));
        } else if (payload.eventType === "INSERT") {
          const row = payload.new as unknown as SupabaseRow;
          setTrips(prev => [...prev, { id: row.id, ...row.data, name: row.name, emoji: row.emoji } as Trip]);
        } else if (payload.eventType === "DELETE") {
          setTrips(prev => prev.filter(t => t.id !== (payload.old as { id: string }).id));
        }
      })
      .subscribe();

    return () => { supabase!.removeChannel(channel); };
  }, [user]);

  const saveTrip = useCallback(async (trip: Trip) => {
    if (!supabase || !user) return;
    const { id, name, emoji, ...data } = trip;
    await supabase.from("trips").upsert({ id, owner_id: user.id, name, emoji, data });
  }, [user]);

  const deleteTrip = useCallback(async (tripId: string) => {
    if (!supabase || !user) return;
    await supabase.from("trips").delete().eq("id", tripId);
  }, [user]);

  const persistAll = useCallback(async (nextTrips: Trip[], nextActiveId?: string) => {
    setTrips(nextTrips);
    if (nextActiveId) setActiveId(nextActiveId);
    if (!supabase || !user) return;

    for (const trip of nextTrips) {
      const { id, name, emoji, ...data } = trip;
      await supabase.from("trips").upsert({ id, owner_id: user.id, name, emoji, data });
    }
  }, [user]);

  const shareTripLink = useCallback(async (_tripId: string, _email: string) => {
    if (!supabase) return { error: "Supabase not configured" };
    const shareUrl = `${window.location.origin}?join=${_tripId}`;
    return { shareUrl };
  }, []);

  return { trips, activeId, setActiveId, loading, saveTrip, deleteTrip, persistAll, shareTrip: shareTripLink };
}
