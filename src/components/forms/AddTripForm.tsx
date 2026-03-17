import { useState } from "react";
import { S, T } from "../../tokens";
import { inputStyle, btnPrimary } from "../../styles";

interface AddTripFormProps {
  onAdd: (trip: { name: string; emoji: string; dates: string; travelers: number; rate: number; startDate: string }) => void;
}

export default function AddTripForm({ onAdd }: AddTripFormProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌏");
  const [dates, setDates] = useState("");
  const [trav, setTrav] = useState("2");
  const [rate, setRate] = useState("9.29");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: S.md }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.textSoft }}>새 여행</div>
      <div style={{ display: "flex", gap: S.sm }}>
        <input style={{ ...inputStyle, width: 50, textAlign: "center" }} value={emoji} onChange={e => setEmoji(e.target.value)} />
        <input style={{ ...inputStyle, flex: 1 }} placeholder="여행 이름" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <input style={inputStyle} placeholder="기간" value={dates} onChange={e => setDates(e.target.value)} />
      <div style={{ display: "flex", gap: S.sm }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: T.textMuted, display: "block", marginBottom: S.xs }}>인원</label>
          <input type="number" style={inputStyle} value={trav} onChange={e => setTrav(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 10, color: T.textMuted, display: "block", marginBottom: S.xs }}>환율</label>
          <input type="number" step="0.01" style={inputStyle} value={rate} onChange={e => setRate(e.target.value)} />
        </div>
      </div>
      <button style={btnPrimary} disabled={!name} onClick={() => onAdd({ name, emoji, dates, travelers: Number(trav), rate: Number(rate), startDate: "" })}>추가</button>
    </div>
  );
}
