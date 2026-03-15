import { S, T, TYPE_EMOJI } from "../tokens";
import { glass } from "../styles";
import Empty from "./ui/Empty";

export default function ItineraryTab({ trip, exDay, setExDay, sortDay, moveItem, setDlg }) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      {trip.days.map((day, di) => {
        const open = exDay === di;
        return (
          <div key={di} style={{ ...glass, overflow: "hidden", transition: "all 0.2s" }}>
            <button onClick={() => setExDay(open ? -1 : di)} style={{ width: "100%", textAlign: "left", padding: `${S.lg}px ${S.lg}px`, display: "flex", alignItems: "center", gap: S.md, border: "none", background: "transparent", cursor: "pointer" }}>
              <div style={{ background: `linear-gradient(135deg, ${T.coral}, ${T.amber})`, color: "#fff", borderRadius: T.rSm, minWidth: 44, height: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 9, fontWeight: 700, lineHeight: 1, letterSpacing: 0.5 }}>DAY</span>
                <span style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{di + 1}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{day.title}</div>
                <div style={{ fontSize: 11, color: T.textSoft, marginTop: S.xs }}>{day.date}</div>
              </div>
              <span style={{ fontSize: 18, color: T.textMuted, transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
            </button>

            {open && (
              <div style={{ padding: `0 ${S.lg}px ${S.lg}px` }}>
                {day.memo && (
                  <div style={{ fontSize: 11, color: T.textSoft, background: T.peach, borderRadius: T.rSm, padding: `${S.sm}px ${S.md}px`, marginBottom: S.md, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
                    {day.memo}
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: S.xs }}>
                  {day.items.map((item, ii) => (
                    <div key={ii} style={{ display: "flex", alignItems: "center", gap: S.sm, padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, transition: "all 0.15s", background: item.hl ? T.coralLight : item.pend ? T.amberLight : "transparent", borderLeft: item.hl ? `3px solid ${T.coral}` : item.pend ? `3px solid ${T.amber}` : "3px solid transparent", opacity: item.skip ? 0.5 : 1 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                        <button onClick={() => moveItem(di, ii, -1)} style={{ background: "none", border: "none", cursor: ii === 0 ? "default" : "pointer", fontSize: 10, color: ii === 0 ? T.glassBorder : T.textMuted, padding: "1px 4px", lineHeight: 1 }}>▲</button>
                        <button onClick={() => moveItem(di, ii, 1)} style={{ background: "none", border: "none", cursor: ii === day.items.length - 1 ? "default" : "pointer", fontSize: 10, color: ii === day.items.length - 1 ? T.glassBorder : T.textMuted, padding: "1px 4px", lineHeight: 1 }}>▼</button>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: S.sm, flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => setDlg({ type: "item", dayIdx: di, itemIdx: ii })}>
                        <div style={{ width: 34, height: 34, borderRadius: S.sm, background: item.hl ? `linear-gradient(135deg, ${T.coral}, ${T.amber})` : "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>
                          {TYPE_EMOJI[item.type] || "📍"}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: item.pend ? T.amber : item.skip ? T.textMuted : T.text, textDecoration: item.skip ? "line-through" : "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</div>
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: T.textMuted, fontVariantNumeric: "tabular-nums", flexShrink: 0 }}>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: S.sm, marginTop: S.md }}>
                  <button onClick={() => sortDay(di)} style={{ flex: 1, padding: `${S.sm}px 0`, borderRadius: T.rSm, border: "1.5px solid #e5e7eb", background: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 600, color: T.textSoft, cursor: "pointer" }}>⏱ 시간순</button>
                  <button onClick={() => setDlg({ type: "item", dayIdx: di, isNew: true })} style={{ flex: 1, padding: `${S.sm}px 0`, borderRadius: T.rSm, border: `1.5px dashed ${T.coral}`, background: T.coralLight, fontSize: 12, fontWeight: 600, color: T.coral, cursor: "pointer" }}>＋ 추가</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      {!trip.days.length && <Empty emoji="📅" text="일정이 없어요" />}
    </div>
  );
}
