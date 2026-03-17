import { S, T } from "../tokens";
import { glass, pill } from "../styles";

import type { Trip, DialogState } from "../types";
import type { User } from "@supabase/supabase-js";

interface AppHeaderProps {
  trips: Trip[];
  activeId: string;
  setActiveId: (id: string) => void;
  trip: Trip;
  user: User | null;
  theme: string;
  setTheme: (theme: string) => void;
  scrolled: boolean;
  ddayText: string;
  todayDayIndex: number;
  setExpandedDay: (day: number) => void;
  setDialog: (d: DialogState) => void;
  shareTrip: () => string;
  showToast: (msg: string) => void;
}

export default function AppHeader({ trips, activeId, setActiveId, trip, user, theme, setTheme, scrolled, ddayText, todayDayIndex, setExpandedDay, setDialog, shareTrip, showToast }: AppHeaderProps) {
  return (
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
  );
}
