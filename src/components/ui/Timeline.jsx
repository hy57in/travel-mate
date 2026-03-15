import { S, T, TYPE_EMOJI } from "../../tokens";

export default function Timeline({ items, todayDayIndex, dayIndex, nextItemIdx, onItemClick }) {
  if (!items.length) return null;
  const isToday = todayDayIndex === dayIndex;

  return (
    <div style={{ position: "relative", paddingLeft: 28 }}>
      {/* Vertical line */}
      <div style={{ position: "absolute", left: 12, top: 4, bottom: 4, width: 2, background: T.divider, borderRadius: 1 }} />

      {items.map((item, i) => {
        const isNext = isToday && nextItemIdx === i;
        const emoji = TYPE_EMOJI[item.type] || "📍";

        return (
          <div key={i} style={{ position: "relative", paddingBottom: i < items.length - 1 ? S.md : 0, cursor: "pointer", opacity: item.skip ? 0.45 : 1 }} onClick={() => onItemClick(i)}>
            {/* Dot on timeline */}
            <div style={{
              position: "absolute", left: -22, top: 2, width: 20, height: 20, borderRadius: "50%",
              background: isNext ? T.mint : item.hl ? `linear-gradient(135deg, ${T.coral}, ${T.amber})` : item.pend ? T.amber : T.divider,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff",
              border: isNext ? `2px solid ${T.mint}` : "2px solid transparent",
              boxShadow: isNext ? `0 0 0 3px ${T.mint}33` : "none",
              zIndex: 1,
            }}>{isNext ? "▶" : item.hl ? "★" : ""}</div>

            {/* Content card */}
            <div style={{
              padding: `${S.sm}px ${S.md}px`, borderRadius: T.rSm, marginLeft: S.sm,
              background: isNext ? T.mintLight : item.hl ? T.coralLight : "transparent",
              borderLeft: isNext ? `2px solid ${T.mint}` : item.hl ? `2px solid ${T.coral}` : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: S.sm }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, fontVariantNumeric: "tabular-nums", minWidth: 36 }}>{item.time}</span>
                <span style={{ fontSize: 15 }}>{emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: item.skip ? T.textMuted : T.text, textDecoration: item.skip ? "line-through" : "none", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.text}</span>
                {item.lat && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.text)}`} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ fontSize: 14, textDecoration: "none", flexShrink: 0 }}>📍</a>
                )}
              </div>
              {item.pend && <span style={{ fontSize: 9, color: T.amber, fontWeight: 700, marginLeft: 48 }}>미정</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
