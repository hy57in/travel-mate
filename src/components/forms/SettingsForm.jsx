import { useState } from "react";
import { S, T } from "../../tokens";
import { inputStyle, btnPrimary } from "../../styles";

export default function SettingsForm({ trip, onSave }) {
  const [name, setName] = useState(trip.name);
  const [emoji, setEmoji] = useState(trip.emoji);
  const [dates, setDates] = useState(trip.dates);
  const [sd, setSd] = useState(trip.startDate || "");
  const [trav, setTrav] = useState(String(trip.travelers));
  const [rate, setRate] = useState(String(trip.rate));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ display: "flex", gap: S.sm }}>
        <input style={{ ...inputStyle, width: 50, textAlign: "center" }} value={emoji} onChange={e => setEmoji(e.target.value)} />
        <input style={{ ...inputStyle, flex: 1 }} value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>기간 표시</label>
        <input style={inputStyle} value={dates} onChange={e => setDates(e.target.value)} />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>출발일 (D-Day용)</label>
        <input type="date" style={inputStyle} value={sd} onChange={e => setSd(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: S.sm }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>인원</label>
          <input type="number" style={inputStyle} value={trav} onChange={e => setTrav(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: T.textSoft, display: "block", marginBottom: S.xs }}>환율 ₩/¥</label>
          <input type="number" step="0.01" style={inputStyle} value={rate} onChange={e => setRate(e.target.value)} />
        </div>
      </div>
      <button style={btnPrimary} onClick={() => onSave({ name, emoji, dates, startDate: sd, travelers: Number(trav), rate: Number(rate) })}>저장</button>
    </div>
  );
}
