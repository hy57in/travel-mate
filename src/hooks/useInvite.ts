import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function useInvite(user: User | null) {
  const [joinTripId, setJoinTripId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get("invite");
    if (inviteId) {
      setJoinTripId(inviteId);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!supabase || !user || !joinTripId) return;

    const joinTrip = async () => {
      const { data: invite } = await supabase!
        .from("trip_invites")
        .select("trip_id")
        .eq("id", joinTripId)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (!invite) return;

      await supabase!.from("trip_members").upsert({
        trip_id: invite.trip_id,
        user_id: user.id,
        role: "editor",
      }, { onConflict: "trip_id,user_id" });

      setJoinTripId(null);
    };

    joinTrip();
  }, [user, joinTripId]);

  const createInvite = useCallback(async (tripId: string): Promise<string | null> => {
    if (!supabase || !user) return null;

    const { data, error } = await supabase!
      .from("trip_invites")
      .insert({ trip_id: tripId, created_by: user.id })
      .select("id")
      .single();

    if (error || !data) return null;

    return `${window.location.origin}?invite=${data.id}`;
  }, [user]);

  return { createInvite, joinTripId };
}
