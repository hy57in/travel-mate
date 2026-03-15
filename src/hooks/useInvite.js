import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";

export default function useInvite(user) {
  const [joinTripId, setJoinTripId] = useState(null);

  // Check URL for invite on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteId = params.get("invite");
    if (inviteId) {
      setJoinTripId(inviteId);
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // Auto-join when user logs in with pending invite
  useEffect(() => {
    if (!supabase || !user || !joinTripId) return;

    const joinTrip = async () => {
      // Look up invite
      const { data: invite } = await supabase
        .from("trip_invites")
        .select("trip_id")
        .eq("id", joinTripId)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (!invite) return;

      // Add as member (ignore if already member)
      await supabase.from("trip_members").upsert({
        trip_id: invite.trip_id,
        user_id: user.id,
        role: "editor",
      }, { onConflict: "trip_id,user_id" });

      setJoinTripId(null);
    };

    joinTrip();
  }, [user, joinTripId]);

  // Create invite link
  const createInvite = useCallback(async (tripId) => {
    if (!supabase || !user) return null;

    const { data, error } = await supabase
      .from("trip_invites")
      .insert({ trip_id: tripId, created_by: user.id })
      .select("id")
      .single();

    if (error || !data) return null;

    return `${window.location.origin}?invite=${data.id}`;
  }, [user]);

  return { createInvite, joinTripId };
}
