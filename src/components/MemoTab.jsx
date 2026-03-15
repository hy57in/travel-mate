import { S, T } from "../tokens";
import { glass, inputStyle } from "../styles";

export default function MemoTab({ trip, ut }) {
  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ ...glass, padding: S.lg }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: S.sm }}>📝 전체 메모</div>
        <textarea
          style={{ ...inputStyle, minHeight: 100, resize: "none", lineHeight: 1.7 }}
          value={trip.memo || ""}
          onChange={e => ut({ memo: e.target.value })}
          placeholder="여행 전체 메모..."
        />
      </div>
      {trip.days.map((day, di) => (
        <div key={di} style={{ ...glass, padding: S.lg }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.text, marginBottom: S.sm }}>Day {di + 1} · {day.date}</div>
          <textarea
            style={{ ...inputStyle, minHeight: 60, resize: "none", lineHeight: 1.7 }}
            value={day.memo || ""}
            onChange={e => { const nd = [...trip.days]; nd[di] = { ...day, memo: e.target.value }; ut({ days: nd }); }}
            placeholder="메모..."
          />
        </div>
      ))}
    </div>
  );
}
